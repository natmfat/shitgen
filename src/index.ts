import { nukeDatabase } from "./client/nuke";

import { Command } from "commander";
import promptly from "promptly";
import { name, description, version } from "../package.json";

import fs from "fs/promises";
import { createDatabase } from "./client/createDatabase";

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
  .command("push")
  .description("push schema to database")
  .argument("<input-schema>", "input sql schema")
  .action(async (inputSchema: string) => {
    const rawSql = await fs.readFile(inputSchema, "utf-8");
    const database = await createDatabase(rawSql);
    await database.push();
    process.exit(0);
  });

program
  .command("generate")
  .description("generate types and utility methods given an sql schema")
  .argument("<input-schema>", "input sql schema")
  .option(
    "--out-file <output-file>",
    "where to put the generated database client"
  )
  .option("--test", "Replace named imports from NPM with local paths")
  .action(async (inputSchema: string, options) => {
    const rawSql = await fs.readFile(inputSchema, "utf-8");
    const database = await createDatabase(rawSql);
    await fs.writeFile(options.outFile, database.toString(!!options.test));
  });

program.parseAsync();
