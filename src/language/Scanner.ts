import { assert } from "console";
import { SQL_WHITESPACE } from "./Lexer";

// @todo token until greedy method (auto balance paren)
// this will allow us to support enum types
// alternatively, we can cheat and simply change behavior in createdatabase if type == enum
// ex) priority ENUM('Low', 'Medium', 'High') NOT NULL

export class Scanner {
  private tokens: string[] = [];
  private pos = 0;

  constructor(token: string[]) {
    this.tokens = token;
  }

  backTrack(pos: number) {
    this.pos = pos;
  }

  getPos() {
    return this.pos;
  }

  skipWhitespace() {
    while (SQL_WHITESPACE.has(this.currentToken())) {
      this.nextToken();
    }
  }

  matchesSequence(sequence: string[]) {
    let initialPos = this.pos;
    for (const expectedToken of sequence) {
      if (this.currentToken() !== expectedToken) {
        this.pos = initialPos;
        return false;
      }
      this.nextToken();
    }
    return true;
  }

  expectSequence(sequence: string[]) {
    // @todo better error message, like "unexpected '(', expected ';'"
    assert(this.matchesSequence(sequence), "expected sequence to match");
  }

  expectSequenceInternal(sequence: string[]) {
    // return false if there is no next token
    if (!this.hasNextToken()) {
      return false;
    }

    let flag = true;
    for (let i = 0; i < sequence.length; i++) {
      const expectedToken = sequence[i];
      if (this.peekToken(i) !== expectedToken) {
        flag = false;
      }
    }

    return flag;
  }

  matches(token: string) {
    return this.currentToken() === token;
  }

  expect(token: string) {
    assert(
      this.matches(token),
      `got ${this.currentToken()}, but expected ${token}`
    );
    this.nextToken();
    return true;
  }

  getTokensUntil(expectedToken: string | (string | string[])[]) {
    const tokensUntil: string[] = [];
    while (this.untilToken(expectedToken)) {
      tokensUntil.push(this.currentToken());
      this.nextToken();
    }
    return tokensUntil;
  }

  // go until, or );
  // scanner.getTokensUntil([",", [")", ";"]])

  untilToken(expectedTokens: string | (string | string[])[]) {
    // return false if there is no next token
    if (!this.hasNextToken()) {
      return false;
    }

    // return true until we reach an expectedToken
    expectedTokens = Array.isArray(expectedTokens)
      ? expectedTokens
      : [expectedTokens];
    let continueFlag = true;
    for (const expectedToken of expectedTokens) {
      if (
        Array.isArray(expectedToken)
          ? this.expectSequenceInternal(expectedToken)
          : this.matches(expectedToken)
      ) {
        continueFlag = false;
      }
    }

    return continueFlag;
  }

  getTokensUntilSequence(sequence: string[]) {
    const tokensUntil: string[] = [];
    while (this.untilTokenSequence(sequence)) {
      tokensUntil.push(this.currentToken());
      this.nextToken();
    }
    return tokensUntil;
  }

  untilTokenSequence(sequence: string[]) {
    // return false if there is no next token
    if (!this.hasNextToken()) {
      return false;
    }

    for (let i = 0; i < sequence.length; i++) {
      const expectedToken = sequence[i];
      if (this.peekToken(i) !== expectedToken) {
        return true;
      }
    }

    return false;
  }

  currentToken() {
    return this.tokens[this.pos];
  }

  peekToken(offset: number = 0) {
    return this.tokens[this.pos + (offset ?? 1)];
  }

  nextToken() {
    this.pos += 1;
    return this.currentToken();
  }

  hasNextToken() {
    return this.pos < this.tokens.length;
  }

  includesTokens(expectedTokens: string[]) {
    for (const expectedToken of expectedTokens) {
      if (!this.tokens.includes(expectedToken)) {
        return false;
      }
    }
    return true;
  }

  includesSequence(expectedTokens: string[]) {
    return this.tokens.join().includes(expectedTokens.join());
  }
}
