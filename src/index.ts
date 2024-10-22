const SQL_OPERATORS = new Set(["(", ")", ","]);

type Nullable<T> = T | null;

class Database {
  tables: Record<string, Table> = {};

  addTable(tableName: string, table: Table): void {
    if (this.tables[tableName]) throw new Error("Table already exists");
    this.tables[tableName] = table;
  }

  getTable(tableName: string) {
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

  references: ColumnReference[] = [];

  constructor(name: string, type: string) {
    this.name = name;
    this.type = type;
  }

  addReference(tableName: string, columnName: string) {
    this.references.push({ tableName, columnName } satisfies ColumnReference);
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

  function enforce(expectedToken: string) {
    if (!expect(expectedToken)) {
      throw new Error(`Expected ${expectedToken}.`);
    }

    return true;
  }

  function getTokensUntil(expectedToken: string) {
    const tokensUntil: string[] = [];
    while (untilToken(expectedToken)) {
      tokensUntil.push(currentToken());
      nextToken();
    }

    return tokensUntil;
  }

  function untilToken(expectedToken: string) {
    return pos < tokens.length && !expect(expectedToken);
  }

  function currentToken() {
    return tokens[pos];
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
      const tableName = scanner.currentToken();
      const table = new Table(tableName);
      database.addTable(tableName, table);
      scanner.nextToken(); // advance past table name
      if (scanner.expect("(")) {
        scanner.nextToken(); // advance past left paren
        while (scanner.untilToken(")")) {
          const [columName, columnType, ...typeModifiers] =
            scanner.getTokensUntil(",");
          scanner.nextToken(); // advance past comma

          const typeScanner = tokenUtils(typeModifiers);
          const isPrimaryKey = typeScanner.includesTokens(["PRIMARY", "KEY"]);
          const notNull =
            typeScanner.includesTokens(["NOT", "NULL"]) || isPrimaryKey;

          const column = new Column(columName, columnType);
          column.modifierPrimaryKey = isPrimaryKey;
          column.modifierNotNull = notNull;

          if (typeScanner.expect("REFERENCES")) {
            const tableNameRef = typeScanner.nextToken(); // advance past REFERENCES & get table name
            typeScanner.enforce("(");
            typeScanner.nextToken();
            const tableColumnRef = typeScanner.nextToken();
            typeScanner.enforce(")");

            column.addReference(tableNameRef, tableColumnRef);
          }

          table.addColumn(column);
        }
      }
    }
    scanner.nextToken();
  }

  console.log(JSON.stringify(database, null, 4));
}

parseSQL(`CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT
);`);
