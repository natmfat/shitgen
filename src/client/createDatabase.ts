import { MockDatabase, MockColumn, MockTable } from "../MockDatabase";
import { MockTypeEnum } from "../MockDatabase/MockType";

import { Lexer } from "../language/Lexer";
import { Scanner } from "../language/Scanner";

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
    // CREATE TYPE mood AS ENUM ('sad', 'ok', 'happy');
    if (scanner.matchesSequence(["CREATE", "TYPE"])) {
      const typeName = scanner.currentToken();
      scanner.nextToken();
      scanner.expectSequence(["AS", "ENUM", "("]);

      const typeArgs = scanner
        .getTokensUntil([[")", ";"]])
        .filter((arg) => arg !== ",")
        .map((arg) => arg.substring(1, arg.length - 1));
      const type = new MockTypeEnum(typeName, typeArgs);
      database.addType(type);
      scanner.nextToken(); // advance past )
      scanner.nextToken(); // advance past ;
      type.rawSql = tokens.slice(startSqlPos, scanner.getPos()).join(" ");
    } else if (
      scanner.matchesSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])
    ) {
      const table = new MockTable(scanner.currentToken());
      database.addTable(table);
      scanner.nextToken(); // advance past table name
      if (scanner.matches("(")) {
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

          if (typeScanner.matches("REFERENCES")) {
            typeScanner.nextToken(); // advance past references
            const tableNameRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond table name
            typeScanner.expect("("); // automatically advances beyond ( after checking current token
            const tableColumnRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond tableColumnRef
            typeScanner.expect(")");
            column.link(tableNameRef, tableColumnRef);
          }

          column.modifierPrimaryKey = modifierPrimaryKey;
          column.modifierNotNull =
            modifierNotNull ||
            modifierPrimaryKey ||
            modifierGenerated ||
            !!column.reference;
          column.modifierDefault = modifierDefault || modifierGenerated;

          table.addColumn(column);
        }

        table.rawSql = tokens.slice(startSqlPos, scanner.getPos()).join(" ");
      }
    }
    scanner.nextToken();
  }

  return database;
}
