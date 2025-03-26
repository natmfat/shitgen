# shitgen

Stands for "shit PostgreSQL type generator". I simply couldn't miss the opportunity on the naming (even if a bit crass), so here we are. The primary motivation of this project is to

- enable rapid prototyping on simple web applications
- allow you to use Prisma-esque method without learning yet another intermediary schema langauge.

`shitgen` is a toy library that generates both types and models with basic DDL. It's basically a bad yet (barely) "functional enough" ORM with support for basic CRUD operations. You will likely have to write raw SQL slapped with type casting for more advanced applications and optimizations.

Currently uses [postgres](https://github.com/porsager/postgres) under the hood.

NOTE: I did not look at how other libraries achieve type generation, so the approach may differ substantially here. All I can say is this TypeScript is cursed and shockingly still works.

## Installation

```bash
pnpm add shitgen -D
```

## Quickstart

1. Setup a schema using basic DDL - only a subset of SQL is actually supported though

```sql
-- app/.server/database/schema.sql
CREATE TABLE IF NOT EXISTS palette_ (
  id bigint UNIQUE GENERATED ALWAYS AS IDENTITY,
  name text NOT NULL,
  thumbnail_colors text[] NOT NULL,
  raw_css text NOT NULL
);

CREATE TABLE IF NOT EXISTS project_ (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  palette_id bigint REFERENCES palette_(id) DEFAULT 0,
  prompt text NOT NULL,
  public boolean DEFAULT true NOT NULL
);

CREATE TABLE IF NOT EXISTS preview_ (
  id bigint UNIQUE GENERATED ALWAYS AS IDENTITY,
  project_id uuid REFERENCES project_(id),
  version smallint DEFAULT 0 NOT NULL,
  prompt text NOT NULL,
  code text,
  thumbnail_src text,
  UNIQUE (project_id, version)
);
```

2. Use the `shitgen` CLI to push changes to the database and generate the client. You can use the following scripts, updating the paths accordingly.

```js
// package.json
{
    // yep, deletes the entire database
    "db:nuke": "shitgen nuke --force",
    // pushes changes to the database based on the schema & seeds it (optional)
    "db:seed": "shitgen push ./app/.server/database/schema.sql && tsx ./app/.server/database/seed.ts",
    // generates the client that you actually import
    "db:generate": "shitgen generate ./app/.server/database/schema.sql --out-file ./app/.server/database/client.ts",
}
```

3. Import and use the client, similar to Prisma

```ts
// app/routes/_index/action.server.ts
const project = await shitgen.project.create({
  select: ["id"],
  data: formData,
});
```

If you're stuck, I use `shitgen` in my clone of [v0](https://github.com/natmfat/v0) so check it out.

## Usage

Nuke your database, clearing it of all data and schemas. Migrations are for the weak.

```bash
shitgen nuke
```

Push your schema to the database - you should probably nuke the database for changes to be applied.

```bash
shitgen push ./schema.sql
# ./schema.sql contains a series of DDL statements, like 'CREATE TABLE IF NOT EXISTS'
```

Generate types from your schema

```bash
shitgen generate ./schema.sql --out-file ./src/database.ts
# ./schema.sql contains a series of DDL statements, like 'CREATE TABLE IF NOT EXISTS'
# --out-file specifies where the generated client should be put
```

Here's what your `package.json` might look like:

```json
{
  "scripts": {
    "db:generate": "shitgen generate ./schema.sql --out-file ./src/database.ts",
    "db:push": "shitgen push ./schema.sql",
    "db:nuke": "shitgen nuke --force"
  }
}
```

The full list of command documentation can be found with `shitgen --help`.

@todo adapters that implement a shared interface for different kinds of postgres clients?  
@todo one to many relationships (auto create?)
