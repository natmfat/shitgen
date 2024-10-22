/*
CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password TEXT, 
  name TEXT
);

model -> interface
user model -> implementation of model
user -> user type, data of user model

// in db/generated/user
export const columns = ["id", "username", "password", "name"]

// in server side code
import * as user from "./db/generated/user"

user.find({ 
  // if column is included here, we should auto-fetch it
  columns: ["id", "username"], // user.utils.exclude(["passsword"])
  where: { username, password }
})

// same args, without limit
user.findMany()

user.create({
  data: { username, password }
})

user.update({
  data: { username, password },
  where: { id }
})

// just extend from user class intead
user.addMethod("coolMethod", () => {
  const rows: Row<user.Type[]> = sql`SELECT * FROM user_`
  return rows[0] || null
})
*/

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
          if (new Set(["(", ")", ","]).has(char)) {
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

  console.log(tokens);

  let pos = 0;

  function expectSequence(sequence: string[]) {
    let initialPos = pos;
    for (const expectedToken of sequence) {
      if (currentToken() !== expectedToken) {
        pos = initialPos;
        return false;
      }

      next();
    }

    return true;
  }

  function expect(expectedToken: string) {
    return currentToken() === expectedToken;
  }

  function getTokensUntil(expectedToken: string) {
    const tokensUntil: string[] = [];
    while (pos < tokens.length && !expect(expectedToken)) {
      tokensUntil.push(currentToken());
      next();
    }

    return tokensUntil;
  }

  function currentToken() {
    return tokens[pos];
  }

  function next() {
    pos += 1;
  }

  while (pos < tokens.length) {
    if (expectSequence(["CREATE", "TABLE", "IF", "NOT", "EXISTS"])) {
      const tableName = currentToken();
      next(); // advance beyond table name
      console.log(tableName);
      if (expect("(")) {
        next(); // advance beyond (

        console.log(getTokensUntil(","));
        console.log(tokens[pos]);
      }
    }
    // console.log(token);
    next();
  }
}

parseSQL(`CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE,
  password TEXT
);`);
