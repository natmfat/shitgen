import { Nullable } from "../types";
import { MockColumn, MockColumnReference } from "./MockColumn";
import { MockTable } from "./MockTable";

// intermediate "database" structure, from raw SQL to TypeScript
export class MockDatabase {
  tables: Record<string, MockTable> = {};

  constructor(
    from: Record<
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
    Object.entries(from).forEach(([tableName, columns]) => {
      const table = new MockTable(tableName);
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
    if (!table) {
      throw new Error("Table does not exist.");
    }

    return table;
  }

  toString() {
    return `{${Object.values(this.tables)
      .map((table) => {
        return `"${table.name}":${table.toString()}`;
      })
      .join(",")}`;
  }

  generateMockDatabase() {
    return `const database = new MockDatabase(${this.toString()});`;
  }

  generateImports() {
    return "";
  }

  /** output entire valid ts file to be saved somewhere */
  generate() {}
}
