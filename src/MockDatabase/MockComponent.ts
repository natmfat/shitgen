export class MockComponent {
  name: string;

  constructor(name: string) {
    this.name = name;
  }

  get formattedName() {
    return MockComponent.formatName(this.name);
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
      .map(
        (component) =>
          component.charAt(0).toUpperCase() + component.substring(1)
      )
      .join("");
  }

  toString(..._: any) {
    throw new Error("mock type to string not implemented");
  }
}
