import { MockEntity } from "./MockEntity";

export class MockType extends MockEntity {
  constructor(
    name: string,
    public type: string = "any",
    public typeArgs: unknown = undefined
  ) {
    super(name);
  }

  generateJSON() {
    return MockEntity.generateJSON(this as MockType, [
      "name",
      "type",
      "typeArgs",
    ]);
  }
}

export class MockTypeAny extends MockType {
  constructor(name: string) {
    super(name, "any", undefined);
  }

  toString() {
    return `type ${this.formattedName} = any;`;
  }
}

export class MockTypeEnum extends MockType {
  constructor(name: string, public typeArgs: string[]) {
    super(name, "enum", typeArgs);
  }

  toString() {
    return `export enum ${this.formattedName} {\n${this.typeArgs
      .map((value) => `  ${value.toUpperCase()} = "${value}"`)
      .join(",\n")}\n}`;
  }
}
