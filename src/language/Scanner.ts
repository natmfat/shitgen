export class Scanner {
  private tokens: string[] = [];
  private pos = 0;

  constructor(token: string[]) {
    this.tokens = token;
  }

  getPos() {
    return this.pos;
  }

  expectSequence(sequence: string[]) {
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

  expect(expectedToken: string) {
    return this.currentToken() === expectedToken;
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

  enforce(expectedToken: string) {
    if (!this.expect(expectedToken)) {
      throw new Error(
        `Got ${this.currentToken()}, but expected ${expectedToken}.`
      );
    }
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
          : this.expect(expectedToken)
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
