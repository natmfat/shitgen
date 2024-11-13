import { Nullable } from "../types";
import { sql } from "../client/sql";

// prettier-ignore
export type GeneratedJSON<
  MockEntityInstance extends MockEntity,
  MockEntityKey extends keyof MockEntityInstance
> = {
  [Key in MockEntityKey]: MockEntityInstance[Key] extends MockEntity
    ? ReturnType<MockEntityInstance[Key]["generateJSON"]>
    // if the property is an array, apply to each element
    : MockEntityInstance[Key] extends Array<infer Element extends MockEntity> 
      ? ReturnType<Element["generateJSON"]>[] 
      // if property is a record, apply to each value
      : MockEntityInstance[Key] extends Record<string, MockEntity> 
        ? {
            [SubKey in keyof MockEntityInstance[Key]]: ReturnType<
              MockEntityInstance[Key][SubKey]["generateJSON"]
            >;
          }
        : MockEntityInstance[Key]; // base case for primitives
};

export class MockEntity {
  name: string;
  rawSql: Nullable<string> = null;

  constructor(name: string) {
    this.name = name;
  }

  get formattedName() {
    return MockEntity.formatName(this.name);
  }

  // @todo apply formatName to keys
  /**
   * Format an identifier in SQL to something more TypeScript-esque \
   * @param name Snake case identifier
   * @returns Camel case identifier
   * @example
   * MockDatabase.formatName("user_") // => "User"
   */
  static formatName(name: string) {
    return name
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.substring(1))
      .join("");
  }

  /**
   * Stringify relevant data by key
   * @returns A record version of the entity
   */
  static generateJSON<
    MockEntityInstance extends MockEntity,
    MockEntityKey extends keyof MockEntityInstance
  >(instance: MockEntityInstance, keys: Array<MockEntityKey> = []) {
    return keys.reduce((acc, key) => {
      let child: unknown = instance[key];
      if (Array.isArray(child)) {
        child = child.map(this.generateChildJSON);
      } else if (isRecord(child)) {
        child = Object.entries(child).reduce(
          (acc, [childKey, childValue]) => ({
            ...acc,
            [childKey]: this.generateChildJSON(childValue),
          }),
          {}
        );
      }
      return {
        ...acc,
        [key]: child,
      };
    }, {}) as GeneratedJSON<MockEntityInstance, MockEntityKey>;
  }

  static generateChildJSON(entity: unknown) {
    return entity instanceof MockEntity ? entity.generateJSON() : entity;
  }

  toString(..._: any) {
    throw new Error("mock entity toString is not implemented");
  }

  generateJSON(): Record<string, unknown> {
    throw new Error("mock entity generateJSON is not implemented");
  }

  async push() {
    if (this.rawSql) {
      await sql.unsafe(this.rawSql);
    }
  }
}

function isRecord(obj: unknown): obj is Record<string, unknown> {
  return (
    typeof obj === "object" &&
    !Array.isArray(obj) &&
    obj !== null &&
    obj !== undefined
  );
}
