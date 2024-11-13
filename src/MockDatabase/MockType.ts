import { Nullable } from "../types";
import { MockComponent } from "./MockComponent";

export class MockType extends MockComponent {
  rawSql: Nullable<string> = null;

  toString() {
    return `type ${this.formattedName} = {};`;
  }
}

export class MockTypeEnum extends MockType {
  constructor(name: string, private typeArgs: string[]) {
    super(name);
  }

  toString() {
    return `export enum ${this.formattedName} {\n${this.typeArgs
      .map((value) => `  ${value.toUpperCase()} = "${value}"`)
      .join(",\n")}\n}`;
  }
}
