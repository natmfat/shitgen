import assert from "assert";
import { Nullable } from "../types";
import { MockColumn, MockColumnReference } from "./MockColumn";
import { MockTable } from "./MockTable";
import { name as packageName } from "../../package.json";

// intermediate "database" structure, from raw SQL to TypeScript
export class MockDatabase {
  tables: Record<string, MockTable> = {};

  constructor(
    fromRecord: Record<
      string,
      Record<
        string,
        {
          type: string;
          modifierPrimaryKey: boolean;
          modifierNotNull: boolean;
          modifierDefault: boolean;
          reference: Nullable<MockColumnReference>;
        }
      >
    > = {}
  ) {
    Object.entries(fromRecord).forEach(([tableName, columns]) => {
      const table = new MockTable(tableName);
      this.tables[tableName] = table;
      Object.entries(columns).forEach(
        ([columnName, { type: columnType, ...props }]) => {
          const column = new MockColumn(columnName, columnType);
          Object.assign(column, props);
          table.addColumn(column);
        }
      );
    });
  }

  addTable(table: MockTable): void {
    if (table.name in this.tables) {
      throw new Error("Table already exists.");
    }

    this.tables[table.name] = table;
  }

  getTable(tableName: string): MockTable {
    const table = this.tables[tableName];
    assert(table, `table with name "${tableName}" does not exist`);
    return table;
  }

  toString() {
    return `{${Object.values(this.tables)
      .map((table) => {
        return `"${table.name}":${table.toString()}`;
      })
      .join(",")}}`;
  }

  generateMockDatabase() {
    return `const database = new MockDatabase(${this.toString()});`;
  }

  generateImports(name: string) {
    return [
      `import { MockDatabase } from "${name}/MockDatabase";`,
      `import { Model } from "${name}/client/Model";`,
      `export { sql } from "${name}/client/sql";`,
    ].join("\n");
  }

  /**
   * Output an entire valid TypeScript file to be saved somewhere
   * @param test Replace named imports from NPM with local paths
   * @returns Fully functional database client, like Prisma, but worse
   */
  generate(test: boolean) {
    return [
      this.generateImports(test ? "." : packageName),
      this.generateMockDatabase(),
      Object.values(this.tables).map((table) => [
        table.generateModelData(),
        table.generateModelAutoGenerated(),
        table.generateModelOptional(),
        table.generateModelRelationship(this),
        table.generateModel(),
      ]),
    ]
      .flat(Infinity)
      .join("\n");
  }
}
