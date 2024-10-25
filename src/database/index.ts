import { Table } from "./Table";

// intermediate "database" structure, from raw SQL to TypeScript
export class Database {
  tables: Record<string, Table> = {};

  addTable(table: Table): void {
    if (table.name in this.tables) {
      throw new Error("Table already exists.");
    }

    this.tables[table.name] = table;
  }

  getTable(tableName: string): Table {
    const table = this.tables[tableName];
    if (!table) {
      throw new Error("Table does not exist.");
    }

    return table;
  }
}
