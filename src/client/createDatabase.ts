import { MockDatabase, MockColumn, MockTable } from "../MockDatabase";

import { Lexer } from "../language/Lexer";
import { Scanner } from "../language/Scanner";

/**
 * Seed real & mock database from raw SQL
 * @param rawSql DDL statements
 * @returns Mock database
 */
export async function createDatabase(rawSql: string) {
  const lexer = new Lexer(rawSql);
  const tokens = lexer.getTokens();
  const scanner = new Scanner(tokens);
  const database = new MockDatabase();

  while (scanner.hasNextToken()) {
    const startPos = scanner.getPos();
    if (scanner.expectSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])) {
      const table = new MockTable(scanner.currentToken());
      database.addTable(table);
      scanner.nextToken(); // advance past table name
      if (scanner.expect("(")) {
        scanner.nextToken(); // advance past left paren

        // begin parsing table columns
        while (scanner.untilToken(";")) {
          const [columnName, columnType, ...typeModifiers] =
            scanner.getTokensUntil([",", [")", ";"]]);

          // @todo investigate more deeply (basically just keep skipping if no column name)
          // we should only hit this if something went wrong tho
          if (!columnName || !columnType) {
            scanner.nextToken();
            continue;
          }

          // @todo look into parsing balanced paren?
          if (columnName === "UNIQUE") {
            scanner.getTokensUntil([")"]);
            scanner.nextToken(); // advance past )
            continue;
          }

          scanner.nextToken(); // advance past comma

          const typeScanner = new Scanner(typeModifiers);
          const modifierPrimaryKey = typeScanner.includesSequence([
            "PRIMARY",
            "KEY",
          ]);
          const modifierNotNull = typeScanner.includesSequence(["NOT", "NULL"]);
          const modifierDefault = typeScanner.includesTokens(["DEFAULT"]);

          const column = new MockColumn(columnName, columnType);

          if (typeScanner.expect("REFERENCES")) {
            typeScanner.nextToken(); // advance past references
            const tableNameRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond table name
            typeScanner.enforce("("); // automatically advances beyond ( after checking current token
            const tableColumnRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond tableColumnRef
            typeScanner.enforce(")");
            column.link(tableNameRef, tableColumnRef);
          }

          column.modifierPrimaryKey = modifierPrimaryKey;
          column.modifierNotNull =
            modifierNotNull || modifierPrimaryKey || !!column.reference;
          column.modifierDefault = modifierDefault;

          table.addColumn(column);
        }

        // no need to skip ) or ; because the while loop will do it for us
      }
      const endPos = scanner.getPos();
      table.rawSql = tokens.slice(startPos, endPos).join(" ");
    }
    scanner.nextToken();
  }

  return database;
}
