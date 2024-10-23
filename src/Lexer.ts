const SQL_OPERATORS = new Set(["(", ")", ",", ";"]);

export class Lexer {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  getTokens() {
    return (
      this.sql.split(" ").map(this.parseWord).flat(Infinity) as string[]
    ).filter((word) => word.length > 0);
  }

  private parseWord(word: string): string[] {
    const trimmed = word.trim();
    const internalTokens: string[] = [];
    let token = "";
    for (let i = 0; i < trimmed.length; i++) {
      const char = trimmed.charAt(i);
      if (SQL_OPERATORS.has(char)) {
        internalTokens.push(token.trim());
        internalTokens.push(char);
        token = "";
      } else {
        token += char;
      }
    }

    internalTokens.push(token.trim());
    return internalTokens;
  }
}
