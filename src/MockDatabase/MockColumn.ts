// why not just use the table class instead of tableName?

import { Nullable } from "../types";
import { MockTable } from "./MockTable";

// because not all tables may be parsed yet!
export type MockColumnReference = {
  tableName: string;
  columnName: string;
};

const convertType = {
  TEXT: "string",
  INT: "number",
  INTEGER: "number",
  BIGINT: "number",
  SMALLINT: "number",
  FLOAT: "number",
  DOUBLE: "number",
  BOOL: "boolean",
  BOOLEAN: "boolean",
};

const COPY_KEYS: Array<keyof MockColumn> = [
  "type",
  "modifierPrimaryKey",
  "modifierNotNull",
  "modifierDefault",
  "typeEnum",
  "reference",
];

export class MockColumn {
  name: string;
  type: string;

  modifierPrimaryKey: boolean = false;
  modifierNotNull: boolean = false;
  modifierDefault: boolean = false;

  typeEnum: Nullable<string[]> = null;

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

  toString() {
    return JSON.stringify(
      COPY_KEYS.reduce((acc, key) => ({ ...acc, [key]: this[key] }), {})
    );
  }

  generateTypeEnum(table: MockTable) {
    return `${table.formattedName}Data${MockTable.formatName(this.name)}`;
  }

  generateType(table: MockTable) {
    let type = this.type;

    // is this type an array
    const isArray = type.endsWith("[]");
    if (isArray) {
      type = type.substring(0, type.length - 2);
    }

    // map type into TypeScript type from record
    const formattedType = type.toUpperCase();
    let convertedType: string = convertType["TEXT"];
    if (formattedType in convertType) {
      convertedType = convertType[formattedType as keyof typeof convertType];
    } else if (formattedType === "ENUM") {
      return this.generateTypeEnum(table);
    }

    // TypeScript type, with array
    const arrayConvertedType = isArray
      ? `Array<${convertedType}>`
      : convertedType;

    return this.modifierNotNull
      ? arrayConvertedType
      : `${arrayConvertedType} | null`;
  }
}
