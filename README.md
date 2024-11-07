# shitgen

Stands for "shit PostgreSQL type generator". I simply couldn't miss the opportunity on the naming (even if a bit crass), so here we are. The primary motivation of this project is to

- enable rapid prototyping on simple web applications
- allow you to use Prisma-esque method without learning yet another intermediary schema langauge.

`shitgen` is a toy library that generates both types and models based on basic DDL. It's basically a bad yet (barely) "functional enough" ORM with support for basic CRUD operations. You will likely have to write raw SQL slapped with type casting for more advanced applications or basic optimizations.

Currently uses [postgres](https://github.com/porsager/postgres) under the hood.

NOTE: I did not look at how other libraries achieve type generation, so the approach may differ substantially here. All I can say is this TypeScript is cursed and shockingly still works.

## Installation

NOTE: not stable, do not install unless you want bugs

```bash
pnpm add shitgen -D
```

## Usage

```bash
# empties the current database and all tables, because migrations are for the weak
shitgen nuke --force

# Generate types & utility methods from a schema file
shitgen generate ./schema.sql -o "./dist/database.ts"
```

```sql
-- schema.sql
CREATE TABLE IF NOT EXISTS user_ (
  id INTEGER PRIMARY KEY,
  username TEXT NOT NULL UNIQUE,
  password TEXT NOT NULL,
  name TEXT DEFAULT 'unnamed',
  avatar_id INTEGER REFERENCES avatar_(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS avatar_ (
  id INTEGER PRIMARY KEY,
  src TEXT NOT NULL,
  alt TEXT
);
```

The full list of command documentation can be found with `shitgen --help`.

@todo adapters that implement a shared interface for different kinds of postgres clients?  
@todo I need testing really badly  
@todo one to many relationships (auto create?)
