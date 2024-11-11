import assert from "assert";
import { Defined, Nullable } from "../types";
import { MockColumn } from "./MockColumn";
import { MockDatabase } from "./MockDatabase";

export class MockTable {
  name: string;
  columns: MockColumn[] = [];
  rawSql: Nullable<string> = null;

  /**
   * Primary key of the table
   * Sort of a shortcut instead of mapping over columns to find it
   * @todo multiple keys???
   */
  primaryKey: Nullable<MockColumn> = null;

  constructor(name: string) {
    this.name = name;
  }

  /**
   * Add a column to the table, assuming one with the same name does not exist
   * @param column A mock column to add to the table
   */
  addColumn(column: MockColumn) {
    assert(
      this.getColumn(column.name) === null,
      "cannot create columns with the same identifier"
    );
    this.columns.push(column);
  }

  getColumn(columnName: string) {
    return this.columns.find((column) => column.name === columnName) || null;
  }

  toString() {
    return `{${this.columns
      .map((column) => `"${column.name}": ${column.toString()}`)
      .join(",")}}`;
  }

  /**
   * Capitalized named export of the table,
   */
  get formattedName() {
    return MockTable.formatName(this.name);
  }

  /**
   * Named export of the table in generated file
   */
  get clientName() {
    return this.lowerCaseFirst(this.formattedName);
  }

  /**
   * user_ to User
   */
  static formatName(name: string) {
    return name
      .split("_")
      .map(
        (component) =>
          component.charAt(0).toUpperCase() + component.substring(1)
      )
      .join("");
  }

  private lowerCaseFirst(name: string) {
    return name.charAt(0).toLowerCase() + name.substring(1);
  }

  private withNull(type: string, notNull: boolean) {
    return notNull ? type : `${type} | null`;
  }

  // all methods prefixed by generate mean "outputs valid Typescript", unless private

  generateEnums() {
    return (
      this.columns.filter((column) => column.typeEnum !== null) as Array<
        Defined<MockColumn, "typeEnum">
      >
    )
      .map(
        (column) =>
          `export enum ${column.generateTypeEnum(this)} {\n${column.typeEnum
            .map((value) => `  ${value.toUpperCase()} = "${value}"`)
            .join(",\n")}\n}`
      )
      .join("\n");
  }

  /**
   * Generate the TypeScript definition for data in a model
   * @returns Stringified TypeScript model data
   */
  generateModelData() {
    const modelData: string[] = [`export type ${this.formattedName}Data = {`];
    for (const column of this.columns) {
      modelData.push(`  ${column.name}: ${column.generateType(this)};`);
    }
    modelData.push("}");
    return modelData.join("\n");
  }

  private generateColumnType(criteria: keyof MockColumn): string {
    const columns = this.columns.filter((column) => column[criteria]);
    return columns.length === 0
      ? "never"
      : columns.map((column) => `"${column.name}"`).join(" | ");
  }

  // @todo research if other types of keys can be autogenerated (or default)

  /**
   * Generate the TypeScript definition for autogenerated columns (primary keys) in a model \
   * @returns List of autogenerated keys that need to be excluded from model data
   */
  generateModelAutoGenerated() {
    return `export type ${
      this.formattedName
    }AutoGenerated = ${this.generateColumnType("modifierPrimaryKey")};`;
  }

  /**
   * Generate the TypeScript definition for optional columns (has a default value) \
   * @returns List of optional keys for model data
   */
  generateModelOptional() {
    return `export type ${
      this.formattedName
    }Optional = ${this.generateColumnType("modifierDefault")};`;
  }

  /**
   * Generate TypeScript definition for columns linked to other tables
   * @returns Model relationship type
   */
  generateModelRelationship(database: MockDatabase) {
    const modelRelationship: string[] = [
      `export type ${this.formattedName}Relationship = {`,
    ];
    for (const column of this.columns) {
      if (column.reference) {
        assert(
          database
            .getTable(column.reference.tableName)
            .getColumn(column.reference.columnName),
          "expected column reference to exist"
        );

        // ensures table exists & adds ot to the relationship
        modelRelationship.push(
          `  ${column.name}: ${
            database.getTable(column.reference.tableName).formattedName
          }Data;`
        );
      }
    }

    modelRelationship.push("}");
    return modelRelationship.join("\n");
  }

  generateModel() {
    return `const ${this.clientName} = new Model<${this.formattedName}Data, ${this.formattedName}AutoGenerated, ${this.formattedName}Optional, ${this.formattedName}Relationship>("${this.name}", database);`;
  }
}
