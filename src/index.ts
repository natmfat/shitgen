import { MockDatabase, MockColumn, MockTable } from "./MockDatabase";
import { nukeDatabase } from "./client/nuke";

import { Lexer } from "./language/Lexer";
import { Scanner } from "./language/Scanner";

import { program } from "commander";
import promptly from "promptly";
// import { name, description, version } from "../package.json" with { type: "json" };

program.name("shitpost").description("decription").version("ok");

program
  .command("nuke")
  .description(
    "Empties the current database, including all tables and data. Migrations are for the weak."
  )
  .option(
    "-f",
    "--force",
    "Force nuke your database. Do NOT do this, unless you really know what you're doing."
  )
  .action(async (options) => {
    if (!options.force) {
      if (
        !(await promptly.confirm(
          "Are you sure you want to nuke your database? "
        ))
      ) {
        console.log("I promise I won't. Probably.");
        return;
      }
    }

    console.log("Nuking database...");
    await nukeDatabase();
    process.exit(0);
  });

program.parseAsync();

// @todo test (generation, scanner, lexer - basically each component)  with vitest

/**
 * Seed real & mock database from raw SQL
 * @param rawSql DDL statements
 * @returns Mock database
 */
async function createDatabase(rawSql: string) {
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

// function generateTypeScript(database: MockDatabase) {
//   console.log(database.generate());
// }

// async function main() {
//   generateTypeScript(
//     await createDatabase(`
//   CREATE TABLE IF NOT EXISTS user_ (
//     id INTEGER PRIMARY KEY,
//     username TEXT NOT NULL UNIQUE,
//     password TEXT NOT NULL,
//     name TEXT DEFAULT 'unnamed',
//     avatar_id INTEGER REFERENCES avatar_(id) ON DELETE CASCADE
//   );

//   CREATE TABLE IF NOT EXISTS avatar_ (
//     id INTEGER PRIMARY KEY,
//     src TEXT NOT NULL,
//     alt TEXT
//   );`)
//   );

//   process.exit(0);
// }

// main();
