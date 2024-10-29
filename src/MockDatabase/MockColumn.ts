// why not just use the table class instead of tableName?

import { Nullable } from "../types";

// because not all tables may be parsed yet!
export type MockColumnReference = {
  tableName: string;
  columnName: string;
};

export class MockColumn {
  name: string;
  type: string;

  modifierPrimaryKey: boolean = false;
  modifierNotNull: boolean = false;
  modifierDefault: boolean = false;

  reference: Nullable<MockColumnReference> = null;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  link(tableName: string, columnName: string) {
    if (this.reference) {
      throw new Error("Column already linked");
    }

    this.reference = { tableName, columnName } satisfies MockColumnReference;
  }
}
