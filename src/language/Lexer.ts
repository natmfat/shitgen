const SQL_OPERATORS = new Set(["(", ")", ",", ";"]);
const SQL_DELIMITER = " ";

export class Lexer {
  private sql: string;

  constructor(sql: string) {
    this.sql = sql;
  }

  getTokens() {
    return (
      this.sql
        .split(SQL_DELIMITER)
        .map(this.parseWord)
        .flat(Infinity) as string[]
    ).filter((word) => word.length > 0);
  }

  // frankly the entire sql string could be parsed like this, not just for words
  // @todo do this to remove comments too
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
