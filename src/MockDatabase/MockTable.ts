import { Nullable } from "../types";
import { MockColumn } from "./MockColumn";

const convertType = {
  TEXT: "string",
  INT: "number",
  INTEGER: "number",
  BIGINT: "number",
  FLOAT: "number",
  DOUBLE: "number",
  BOOL: "boolean",
  BOOLEAN: "boolean",
};

export class MockTable {
  name: string;
  columns: MockColumn[] = [];

  primaryKey: Nullable<MockColumn> = null;

  constructor(name: string) {
    this.name = name;
  }

  addColumn(column: MockColumn) {
    this.columns.push(column);
  }

  getColumn(columnName: string) {
    return this.columns.find((column) => column.name === columnName);
  }

  /**
   * user_ to User
   */
  private formattedName() {
    return this.name
      .split("_")
      .map(
        (component) =>
          component.charAt(0).toUpperCase() + component.substring(1)
      )
      .join("");
  }

  private withNull(type: string, notNull: boolean) {
    return notNull ? type : `${type} | null`;
  }

  // all methods prefixed by generate mean "outputs valid Typescript", unless private
  generateColumns() {
    const columns = JSON.stringify(
      this.columns.map((column) => column.name),
      null,
      2
    );
    return `export const columns = ${columns};`;
  }

  generateModelData() {
    const userDataType: string[] = [`type ${this.formattedName()}Data = {`];
    for (const column of this.columns) {
      const type: string = this.withNull(
        column.type in convertType
          ? convertType[column.type as keyof typeof convertType]
          : convertType["TEXT"],
        column.modifierNotNull
      );

      userDataType.push(`  ${column.name}: ${type};`);
    }
    userDataType.push("}");
    return userDataType.join("\n");
  }

  generateModel() {
    return `
export class ${this.formattedName()}Model {
  static find() {
  }
}`;
  }
}
