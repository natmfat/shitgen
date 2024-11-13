// why not just use the table class instead of tableName?

import { Nullable } from "../types";
import { MockComponent } from "./MockComponent";
import { MockDatabase } from "./MockDatabase";

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
  UUID: "string", // @todo uuid validator type
};

export class MockColumn extends MockComponent {
  type: string;

  modifierPrimaryKey: boolean = false;
  modifierNotNull: boolean = false;
  modifierDefault: boolean = false;

  reference: Nullable<MockColumnReference> = null;

  constructor(name: string, type: string) {
    super(name);
    this.type = type;
  }

  link(tableName: string, columnName: string) {
    if (this.reference) {
      throw new Error("Column already linked");
    }

    this.reference = { tableName, columnName } satisfies MockColumnReference;
  }

  /**
   * Stringify relevant column data
   * @returns A record version of the column
   */
  toString() {
    return JSON.stringify(
      (
        [
          "type",
          "modifierPrimaryKey",
          "modifierNotNull",
          "modifierDefault",
          "reference",
        ] satisfies Array<keyof MockColumn>
      ).reduce((acc, key) => ({ ...acc, [key]: this[key] }), {})
    );
  }

  generateType(database: MockDatabase) {
    let type = this.type;

    // is this type an array
    const isArray = type.endsWith("[]");
    if (isArray) {
      type = type.substring(0, type.length - 2);
    }

    // map type into TypeScript type from record
    let convertedType: string =
      convertType[type.toUpperCase() as keyof typeof convertType] ||
      convertType["TEXT"];
    if (database.hasType(type)) {
      convertedType = database.getType(type).formattedName;
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
