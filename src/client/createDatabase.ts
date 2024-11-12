import { MockDatabase, MockColumn, MockTable } from "../MockDatabase";

import { Lexer } from "../language/Lexer";
import { Scanner } from "../language/Scanner";
import { Nullable } from "../types";

// @todo look into parsing balanced paren?

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
    const startSqlPos = scanner.getPos();
    if (scanner.expectSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])) {
      const table = new MockTable(scanner.currentToken());
      database.addTable(table);
      scanner.nextToken(); // advance past table name
      if (scanner.expect("(")) {
        scanner.nextToken(); // advance past left paren

        // begin parsing table columns
        while (scanner.untilToken(";")) {
          const columnName = scanner.currentToken();
          const columnType = scanner.nextToken();
          scanner.nextToken();

          // if it's "UNIQUE" or "PRIMARY", this ain't a column name
          if (columnName === columnName.toUpperCase()) {
            scanner.getTokensUntil([")"]);
            scanner.nextToken(); // advance past )
            continue;
          }

          let typeArgs: Nullable<string[]> = null;

          if (columnType === "ENUM") {
            scanner.nextToken(); // skip left paren
            typeArgs = scanner
              .getTokensUntil(")")
              .filter((value) => value !== ",") // strip comments
              .map((value) => value.substring(1, value.length - 1)); // remove starting and ending quotes
            scanner.nextToken(); // skip right paren
          }

          const typeModifiers = scanner.getTokensUntil([",", [")", ";"]]);

          // @todo investigate more deeply (basically just keep skipping if no column name)
          // we should only hit this if something went wrong tho
          if (!columnName || !columnType) {
            scanner.nextToken();
            continue;
          }

          scanner.nextToken(); // advance past comma

          const typeScanner = new Scanner(typeModifiers);

          // get column modifiers
          const modifierPrimaryKey = typeScanner.includesSequence([
            "PRIMARY",
            "KEY",
          ]);
          const modifierGenerated = typeScanner.includesSequence([
            "GENERATED",
            "ALWAYS",
            "AS",
            "IDENTITY",
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
            modifierNotNull ||
            modifierPrimaryKey ||
            modifierGenerated ||
            !!column.reference;
          column.modifierDefault = modifierDefault || modifierGenerated;
          column.typeArgs = typeArgs;

          table.addColumn(column);
        }

        // no need to skip ) or ; because the while loop will do it for us
      }
      table.rawSql = tokens.slice(startSqlPos, scanner.getPos()).join(" ");
    }
    scanner.nextToken();
  }

  return database;
}
