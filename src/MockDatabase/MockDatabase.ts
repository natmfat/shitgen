import { MockTable } from "./MockTable";

// intermediate "database" structure, from raw SQL to TypeScript
export class MockDatabase {
  tables: Record<string, MockTable> = {};

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
}
