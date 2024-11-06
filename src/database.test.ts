import { test, expect, describe, beforeAll } from "vitest";
import { PaletteData, shitgen, sql } from "./database";
import { nukeDatabase } from "./client/nuke";

const palettes: Array<Omit<PaletteData, "id">> = [
  {
    name: "Replit Light",
    thumbnail_colors: ["#ebeced", "#fcfcfc", "#6bb5ff", "#0f87ff"],
    raw_css: "",
  },
  {
    name: "Replit Dark",
    thumbnail_colors: ["#0e1525", "#1c2333", "#0053a6", "#0079f2"],
    raw_css: "",
  },
];

// @todo beforeAll should seed, afterall should delete?

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
