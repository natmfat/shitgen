import { test, expect } from "vitest";
import * as db from "./database";
import { describe } from "node:test";

// @todo nuke & seed db in setup

test("client accurately translates queries", () => {
  describe("[project_] find many with include", async () => {
    expect(
      await db.project.findMany({
        include: {
          palette_id: {
            id: true,
            thumbnail_colors: true,
          },
        },
      })
    ).toStrictEqual(
      await db.sql`
        SELECT "project_".*, "palette_"."id", "palette_"."thumbnail_colors" FROM "project_"
        JOIN "palette_" ON "project_"."palette_id" = "palette_"."id"
      `
    );
  });
});
