import { test, expect, beforeAll } from "vitest";
import { shitgen, sql } from "./database";
import { describe } from "node:test";
import { nukeDatabase } from "./client/nuke";

beforeAll(async () => {
  await nukeDatabase();

  // seed palettes
  await sql`
    INSERT INTO palette_ (name, thumbnail_colors, raw_css)
    VALUES ("Replit Light", ${["#ebeced", "#fcfcfc", "#6bb5ff", "#0f87ff"]}, "")
  `;
  await sql`
    INSERT INTO palette_ (name, thumbnail_colors, raw_css)
    VALUES ("Replit Dark", ${["#0e1525", "#1c2333", "#0053a6", "#0079f2"]}, "")
  `;

  // create a few fake projects w/ previews
});

test("client accurately translates queries", () => {
  describe("[project_] find many with include", async () => {
    expect(
      await shitgen.project.findMany({
        include: {
          palette_id: {
            id: true,
            thumbnail_colors: true,
          },
        },
      })
    ).toStrictEqual(
      await sql`
        SELECT "project_".*, "palette_"."id", "palette_"."thumbnail_colors" FROM "project_"
        JOIN "palette_" ON "project_"."palette_id" = "palette_"."id"
      `
    );
  });
});
