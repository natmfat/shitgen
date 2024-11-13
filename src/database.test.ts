import { test, expect, describe } from "vitest";
import { shitgen, sql } from "./database";

// @todo beforeAll should seed, afterall should delete?
// @todo should be able to do one to many relationships with where + include

describe("client accurately translates queries", () => {
  describe("palette_ find many", () => {
    test("no args", async () => {
      expect(await shitgen.palette.findMany({})).toEqual(
        await sql`SELECT * from palette_`
      );
    });

    test("+ select", async () => {
      expect(await shitgen.palette.findMany({ select: ["name"] })).toEqual(
        await sql`SELECT name from palette_`
      );
    });

    test("+ where", async () => {
      expect(
        await shitgen.palette.findMany({ where: { name: "Replit Dark" } })
      ).toEqual(
        await sql`SELECT name from palette_ WHERE name = 'Replit Dark'`
      );
    });
  });
});
