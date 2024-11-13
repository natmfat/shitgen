import assert from "assert";
import { Nullable } from "../types";
import { MockColumn } from "./MockColumn";
import { MockTable } from "./MockTable";
import { name as packageName } from "../../package.json";
import { MockType, MockTypeAny, MockTypeEnum } from "./MockType";
import { GeneratedJSON, MockEntity } from "./MockEntity";

type MockDatabaseStructure = GeneratedJSON<MockDatabase, "types" | "tables">;

// intermediate "database" structure, from raw SQL to TypeScript
export class MockDatabase extends MockEntity {
  types: Record<string, MockType> = {};
  tables: Record<string, MockTable> = {};

  constructor(structure: Nullable<MockDatabaseStructure> = null) {
    super(packageName);
    if (structure) {
      this.fromGeneratedJSON(structure);
    }
  }

  fromGeneratedJSON(structure: MockDatabaseStructure) {
    Object.entries(structure.tables).forEach(([tableName, { columns }]) => {
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

    Object.entries(structure.types).forEach(
      ([typeName, { type, typeArgs }]) => {
        switch (type) {
          case "enum":
            this.addType(new MockTypeEnum(typeName, typeArgs as string[]));
            break;
          case "any":
          default:
            this.addType(new MockTypeAny(typeName));
            return;
        }
      }
    );
  }

  generateJSON() {
    return MockEntity.generateJSON(this as MockDatabase, ["types", "tables"]);
  }

  addTable(table: MockTable) {
    assert(!(table.name in this.tables), "table already exists");
    this.tables[table.name] = table;
  }

  getTable(tableName: string): MockTable {
    assert(
      tableName in this.tables,
      `table with name "${tableName}" does not exist`
    );
    return this.tables[tableName];
  }

  // https://www.postgresql.org/docs/current/datatype-enum.html
  addType(type: MockType) {
    assert(!(type.name in this.types), "type already exists");
    this.types[type.name] = type;
  }

  hasType(typeName: string) {
    return typeName in this.types;
  }

  getType(typeName: string) {
    assert(
      this.hasType(typeName),
      `type with name "${typeName}" does not exist`
    );
    return this.types[typeName];
  }

  generateMockDatabase() {
    return `const database = new MockDatabase(${JSON.stringify(
      this.generateJSON(),
      null,
      4
    )});`;
  }

  /**
   * Include any necessary imports for the client to use
   * @param name Import path to use, uses "shitgen" for real environments and . for testing
   * @returns Necessary imports, like the base model and mock db
   */
  generateImports(name: string) {
    return [
      `import { MockDatabase } from "${name}/MockDatabase";`,
      `import { Model } from "${name}/client/Model";`,
      `export { sql } from "${name}/client/sql";`,
    ].join("\n");
  }

  /**
   * Create "shitgen" client, containing each model and their methods
   * @returns
   */
  generateClient() {
    return `export const shitgen = { ${Object.values(this.tables)
      .map((table) => table.clientName)
      .join(", ")} };`;
  }

  generateTypes() {
    return Object.values(this.types)
      .map((type) => type.toString())
      .join("\n");
  }

  /**
   * Output an entire valid TypeScript file to be saved somewhere
   * @param test Replace named imports from NPM with local paths
   * @returns Fully functional database client, like Prisma, but worse
   */
  toString(test: boolean = false) {
    return [
      this.generateImports(test ? "." : packageName),
      this.generateMockDatabase(),
      this.generateTypes(),
      ...Object.values(this.tables).map((table) => table.toString(this)),
      this.generateClient(),
    ].join("\n");
  }
}
