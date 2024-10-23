import { Column, Database, Table } from "./Database";
import { Lexer } from "./Lexer";
import { Scanner } from "./Scanner";

// @todo tests

function createDatabase(sql: string) {
  const tokens = new Lexer(sql).getTokens();
  const scanner = new Scanner(tokens);
  const database = new Database();

  while (scanner.hasNextToken()) {
    if (scanner.expectSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])) {
      const table = new Table(scanner.currentToken());
      database.addTable(table);
      scanner.nextToken(); // advance past table name
      if (scanner.expect("(")) {
        scanner.nextToken(); // advance past left paren

        // begin parsing table columns
        while (scanner.untilToken(";")) {
          const [columnName, columnType, ...typeModifiers] =
            scanner.getTokensUntil([",", [")", ";"]]);

          scanner.nextToken(); // advance past comma

          const typeScanner = new Scanner(typeModifiers);
          const isPrimaryKey = typeScanner.includesTokens(["PRIMARY", "KEY"]);
          const notNull =
            typeScanner.includesTokens(["NOT", "NULL"]) || isPrimaryKey;

          const column = new Column(columnName, columnType);
          column.modifierPrimaryKey = isPrimaryKey;
          column.modifierNotNull = notNull;

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

          table.addColumn(column);
        }

        // no need to skip ) or ; because the while loop will do it for us
      }
    }
    scanner.nextToken();
  }

  return database;
}

function generateTypeScript(database: Database) {
  console.log(JSON.stringify(database, null, 4));
}

generateTypeScript(
  createDatabase(`
CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT, 
  name TEXT
);

CREATE TABLE IF NOT EXISTS post_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES user_(id) ON DELETE CASCADE
);`)
);
