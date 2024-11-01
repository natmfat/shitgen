import { MockDatabase, MockColumn, MockTable } from "./MockDatabase";
import { nukeDatabase } from "./client/nuke";

import { Lexer } from "./language/Lexer";
import { Scanner } from "./language/Scanner";

import { Command } from "commander";
import promptly from "promptly";
import { name, description, version } from "../package.json";

import fs from "fs/promises";
import { sql } from "./client/sql";

// @todo testing with vitest
// @todo error handling

const program = new Command();

program.name(name).description(description).version(version);

program
  .command("nuke")
  .description(
    "empties the current database because migrations are for the weak"
  )
  .option("--force", "skip confirmation prompt - do NOT do this")
  .action(async (options) => {
    if (!options.force) {
      if (!(await promptly.confirm("are you really sure? "))) {
        return;
      }
    }

    console.log("nuked database");
    await nukeDatabase();
    process.exit(0);
  });

program
  .command("seed")
  .description("push schema to database")
  .argument("<input-schema>", "input sql schema")
  .action(async (inputSchema: string) => {
    const rawSql = await fs.readFile(inputSchema, "utf-8");
    const database = await createDatabase(rawSql);
    for (const table of Object.values(database.tables)) {
      if (table.rawSql) {
        await sql.unsafe(table.rawSql);
      }
    }
  });

program
  .command("generate")
  .description("generate types and utility methods given an sql schema")
  .argument("<input-schema>", "input sql schema")
  .option(
    "--out-file <output-file>",
    "where to put the generated database client"
  )
  .action(async (inputSchema: string, options) => {
    const rawSql = await fs.readFile(inputSchema, "utf-8");
    const database = await createDatabase(rawSql);
    await fs.writeFile(options.outFile, database.generate());
  });

program.parseAsync();

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
