const SQL_OPERATORS = new Set(["(", ")", ",", ";"]);

type Nullable<T> = T | null;

// @todo refactor
// @todo tests

class Database {
  tables: Record<string, Table> = {};

  addTable(table: Table): void {
    if (table.name in this.tables) {
      throw new Error("Table already exists.");
    }

    this.tables[table.name] = table;
  }

  getTable(tableName: string): Table {
    const table = this.tables[tableName];
    if (!table) {
      throw new Error("Table does not exist.");
    }

    return table;
  }
}

class Table {
  name: string;
  columns: Column[] = [];

  primaryKey: Nullable<Column> = null;

  constructor(name: string) {
    this.name = name;
  }

  addColumn(column: Column) {
    this.columns.push(column);
  }
}

// why not just use the table class?
// because not all tables may be parsed yet!
type ColumnReference = { tableName: string; columnName: string };

class Column {
  name: string;
  type: string;

  modifierPrimaryKey: boolean = false;
  modifierNotNull: boolean = false;

  reference: Nullable<ColumnReference> = null;

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  link(tableName: string, columnName: string) {
    if (this.reference) {
      throw new Error("Column already linked");
    }

    this.reference = { tableName, columnName } satisfies ColumnReference;
  }
}

function tokenUtils(tokens: string[]) {
  let pos = 0;

  function expectSequence(sequence: string[]) {
    let initialPos = pos;
    for (const expectedToken of sequence) {
      if (currentToken() !== expectedToken) {
        pos = initialPos;

        return false;
      }
      nextToken();
    }

    return true;
  }

  function expect(expectedToken: string) {
    return currentToken() === expectedToken;
  }

  function expectSequenceInternal(sequence: string[]) {
    // return false if there is no next token
    if (!hasNextToken()) {
      return false;
    }

    let flag = true;
    for (let i = 0; i < sequence.length; i++) {
      const expectedToken = sequence[i];
      if (peekToken(i) !== expectedToken) {
        flag = false;
      }
    }

    return flag;
  }

  function enforce(expectedToken: string) {
    if (!expect(expectedToken)) {
      throw new Error(`Got ${currentToken()}, but expected ${expectedToken}.`);
    }
    nextToken();
    return true;
  }

  function getTokensUntil(expectedToken: string | (string | string[])[]) {
    const tokensUntil: string[] = [];
    while (untilToken(expectedToken)) {
      tokensUntil.push(currentToken());
      nextToken();
    }
    return tokensUntil;
  }

  // go until, or );
  // scanner.getTokensUntil([",", [")", ";"]])

  function untilToken(expectedTokens: string | (string | string[])[]) {
    // return false if there is no next token
    if (!hasNextToken()) {
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
          ? expectSequenceInternal(expectedToken)
          : expect(expectedToken)
      ) {
        continueFlag = false;
      }
    }

    return continueFlag;
  }

  function getTokensUntilSequence(sequence: string[]) {
    const tokensUntil: string[] = [];
    while (untilTokenSequence(sequence)) {
      tokensUntil.push(currentToken());
      nextToken();
    }
    return tokensUntil;
  }

  function untilTokenSequence(sequence: string[]) {
    // return false if there is no next token
    if (!hasNextToken()) {
      return false;
    }

    for (let i = 0; i < sequence.length; i++) {
      const expectedToken = sequence[i];
      if (peekToken(i) !== expectedToken) {
        return true;
      }
    }

    return false;
  }

  function currentToken() {
    return tokens[pos];
  }

  function peekToken(offset: number = 0) {
    return tokens[pos + (offset ?? 1)];
  }

  function nextToken() {
    pos += 1;
    return currentToken();
  }

  function hasNextToken() {
    return pos < tokens.length;
  }

  function includesTokens(expectedTokens: string[]) {
    for (const expectedToken of expectedTokens) {
      if (!tokens.includes(expectedToken)) {
        return false;
      }
    }

    return true;
  }

  return {
    expectSequence,
    expect,
    enforce,
    getTokensUntil,
    getTokensUntilSequence,
    untilToken,
    currentToken,
    nextToken,
    hasNextToken,
    includesTokens,
    pos: () => pos,
  };
}

function parseSQL(sql: string) {
  const tokens = (
    sql
      .split(" ")
      .map((word) => {
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
      })
      .flat(Infinity) as string[]
  ).filter((word) => word.length > 0);

  const database = new Database();
  const scanner = tokenUtils(tokens);

  while (scanner.hasNextToken()) {
    if (scanner.expectSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])) {
      const table = new Table(scanner.currentToken());
      database.addTable(table);
      scanner.nextToken(); // advance past table name
      if (scanner.expect("(")) {
        scanner.nextToken(); // advance past left paren

        // begin parsing table columns
        while (scanner.untilToken(";")) {
          const [columnName, columnType, ...typeModifiers] =
            scanner.getTokensUntil([",", [")", ";"]]);

          console.log(columnName, columnType, typeModifiers);
          scanner.nextToken(); // advance past comma

          const typeScanner = tokenUtils(typeModifiers);
          const isPrimaryKey = typeScanner.includesTokens(["PRIMARY", "KEY"]);
          const notNull =
            typeScanner.includesTokens(["NOT", "NULL"]) || isPrimaryKey;

          const column = new Column(columnName, columnType);
          column.modifierPrimaryKey = isPrimaryKey;
          column.modifierNotNull = notNull;

          if (typeScanner.expect("REFERENCES")) {
            typeScanner.nextToken(); // advance past references
            const tableNameRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond table name
            typeScanner.enforce("("); // automatically advances beyond ( after checking current token
            const tableColumnRef = typeScanner.currentToken();
            typeScanner.nextToken(); // advance beyond tableColumnRef
            typeScanner.enforce(")");
            column.link(tableNameRef, tableColumnRef);
          }

          table.addColumn(column);
        }

        // no need to skip ) or ; because the while loop will do it for us
      }
    }
    scanner.nextToken();
  }

  console.log(JSON.stringify(database, null, 4));
}

parseSQL(`
CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT, 
  name TEXT
);

CREATE TABLE IF NOT EXISTS post_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  content TEXT,
  author_id INTEGER REFERENCES user_(id) ON DELETE CASCADE
);
`);
