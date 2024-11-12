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
