// why not just use the table class instead of tableName?

import { Nullable } from "../types";

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
