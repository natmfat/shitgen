import { expect, describe, test } from "vitest";
import { Lexer } from "./Lexer";

function choice<T>(array: T[]) {
  return array[Math.floor(Math.random() * array.length)] as T;
}

function random(min: number, max: number) {
  return Math.floor(Math.random() * (max - min)) + min;
}

const getTokens = (sql: string) => new Lexer(sql).getTokens();

// @todo lexer should give tokens "types" (ie: identifier, sql statement, identifier type, comma, etc.) (maybe in v2?)

export const SQL_CREATE_TABLE_PALETTE = /* sql */ `CREATE TABLE IF NOT EXISTS palette_ (
  id bigint UNIQUE GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  thumbnail_colors text[],
  raw_css text NOT NULL
);`;

export const SQL_CREATE_TABLE_PROJECT = /* sql */ `CREATE TABLE IF NOT EXISTS project_ (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  palette_id bigint REFERENCES palette_(id) DEFAULT 0,
  prompt text NOT NULL,
  public boolean DEFAULT true
);`;

export const SQL_CREATE_TABLE_PREVIEW = /* sql */ `CREATE TABLE IF NOT EXISTS preview_ (
  id bigint UNIQUE GENERATED ALWAYS AS IDENTITY,
  project_id uuid REFERENCES project_(id),
  version smallint DEFAULT 0,
  prompt text NOT NULL,
  code text,
  thumbnail_src text,
  UNIQUE (project_id, version) 
);`;

describe("lexer obtains tokens accurately", () => {
  describe("handle white space", () => {
    test("empty sql statement", () => {
      expect(getTokens("")).toStrictEqual([]);
    });

    test("randomized strings", () => {
      expect(
        getTokens(
          new Array(random(1, 100))
            .fill(0)
            .map(() => choice([" ", "\t", "\n"]))
            .join(choice([" ", "\t", "\n"]))
        )
      ).toEqual([]);
    });
  });

  describe("create table", () => {
    test("palette_", () => {
      // prettier-ignore
      expect(getTokens(SQL_CREATE_TABLE_PALETTE)).toStrictEqual([
      "CREATE", "TABLE", "IF", "NOT", "EXISTS", "palette_", "(",
        "id", "bigint", "UNIQUE", "GENERATED", "ALWAYS", "AS", "IDENTITY", ",",
        "name", "text", "NOT", "NULL", ",",
        "thumbnail_colors", "text[]", ",",
        "raw_css", "text", "NOT", "NULL",
      ")", ";",
    ]);
    });

    test("project_", () => {
      // prettier-ignore
      expect(getTokens(SQL_CREATE_TABLE_PROJECT)).toStrictEqual([
        "CREATE", "TABLE", "IF", "NOT", "EXISTS", "project_", "(",
          "id", "uuid", "PRIMARY", "KEY", "DEFAULT", "gen_random_uuid", "(", ")", ",",
          "palette_id", "bigint", "REFERENCES", "palette_", "(", "id", ")", "DEFAULT", "0", ",",
          "prompt", "text", "NOT", "NULL", ",",
          "public", "boolean", "DEFAULT", "true",
        ")", ";",
      ]);
    });

    test("preview_", () => {
      // prettier-ignore
      expect(getTokens(SQL_CREATE_TABLE_PREVIEW)).toStrictEqual([
        "CREATE", "TABLE", "IF", "NOT", "EXISTS", "preview_", "(",
          "id", "bigint", "UNIQUE", "GENERATED", "ALWAYS", "AS", "IDENTITY", ",",
          "project_id", "uuid", "REFERENCES", "project_", "(", "id", ")", ",",
          "version", "smallint", "DEFAULT", "0", ",",
          "prompt", "text", "NOT", "NULL", ",",
          "code", "text", ",",
          "thumbnail_src", "text", ",",
          "UNIQUE", "(", "project_id", ",", "version", ")",
        ")", ";"
      ])
    });
  });
});
