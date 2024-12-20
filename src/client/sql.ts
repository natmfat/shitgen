import postgres from "postgres";

// https://github.com/remix-run/examples/blob/main/pm-app/app/database.server.tsx

type PostgresClient = ReturnType<typeof postgres>;

let sql: PostgresClient;

declare global {
  // we need to use var for global magic
  // eslint-disable-next-line
  var __sql: PostgresClient;
}

if (process.env.NODE_ENV === "production") {
  sql = postgres();
} else {
  global.__sql =
    global.__sql ||
    postgres({
      debug: true,
    });
  sql = global.__sql;
}

export { sql };
