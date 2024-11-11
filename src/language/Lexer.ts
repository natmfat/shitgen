import { Scanner } from "./Scanner";

export const SQL_OPERATORS = new Set(["(", ")", ",", ";"]);
export const SQL_WHITESPACE = new Set([" ", "\t", "\n"]);

export class Lexer {
  private sql: string;
  private tokens: string[] = [];

  constructor(sql: string) {
    this.sql = sql;
    this.tokens = Lexer.skipWhitespace(Lexer.skipComments(this.analyze()));
  }

  getTokens() {
    return this.tokens;
  }

  private analyze() {
    const nextTokens: string[] = [];
    let token: string = "";

    const pushToken = (nextToken: string) => {
      const formattedToken = nextToken.trim();
      if (formattedToken.length > 0) {
        nextTokens.push(formattedToken);
      }
    };

    for (let i = 0; i < this.sql.length; i++) {
      const char = this.sql.charAt(i);
      if (SQL_OPERATORS.has(char) || SQL_WHITESPACE.has(char)) {
        pushToken(token);
        nextTokens.push(char);
        token = "";
      } else {
        token += char;
      }
    }
    pushToken(token);
    return nextTokens;
  }

  // @todo this should probably be moved to createDatabase/whatever will interpret the tokens
  // I'm just doing it this way to save time
  /**
   * Given an array of tokens, remove comments
   * @param tokens Array of tokens, returned from Lexer analysis
   * @returns Array of tokens, free of comments
   */
  static skipComments(tokens: string[]) {
    const nextTokens: string[] = [];
    const scanner = new Scanner(tokens);
    while (scanner.hasNextToken()) {
      // skip comments
      if (scanner.currentToken() === "--") {
        scanner.getTokensUntil("\n");
        scanner.nextToken(); // skip whitespace
      }

      nextTokens.push(scanner.currentToken());
      scanner.nextToken();
    }
    return nextTokens;
  }

  /**
   * Given an array of tokens, remove any whitespace \
   * Do this after comments are removed (which depend on whitespace to terminate)
   * @param tokens Array of tokens, returned from Lexer analysis
   * @returns Array of tokens, free of whitepace
   */
  static skipWhitespace(tokens: string[]) {
    return tokens
      .map((token) => token.trim())
      .filter((token) => token.length > 0);
  }
}
