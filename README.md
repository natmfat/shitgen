# shitpost

Stands for "shit PostgreSQL type generator", but I couldn't miss the opportunity on the naming (even if a bit crass) so here we are.

`shitpost` is a toy library that generates types based on basic DDL (and I mean basic), rather than learning a new schema associated with, say, Prisma. It's not really a complete ORM, and you will probably have to write raw SQL slapped with type casting for more advanced applications.

Uses [postgres](https://github.com/porsager/postgres) under the hood.

NOTE: I did not look at how other libraries achieve type generation, so the approach may differ substantially here. All I can say is this TypeScript is cursed and shockingly still works.

## Installation

## Usage

```bash
# empties the current database and all tables, because migrations are for the weak
shitpost nuke --force

# Generate types & utility methods from a schema file including basic DDL
shitpost generate schema.sql --output .server/database
```

The full list of command documentation can be found with `shitpost help`.

@todo adapters that implement a shared interface for different kinds of postgres clients?
