import { Nullable } from "./types";

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

export class Table {
  name: string;
  columns: Column[] = [];

  primaryKey: Nullable<Column> = null;

  constructor(name: string) {
    this.name = name;
  }

  addColumn(column: Column) {
    this.columns.push(column);
  }
}

// why not just use the table class instead of tableName?
// because not all tables may be parsed yet!
export type ColumnReference = {
  tableName: string;
  columnName: string;
};

export class Column {
  name: string;
  type: string;

  modifierPrimaryKey: boolean = false;
  modifierNotNull: boolean = false;

  reference: Nullable<ColumnReference> = null;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  link(tableName: string, columnName: string) {
    if (this.reference) {
      throw new Error("Column already linked");
    }

    this.reference = { tableName, columnName } satisfies ColumnReference;
  }
}
