# shitpost

Stands for "shit PostgreSQL type generator", but I couldn't miss the opportunity on the naming (even if a bit crass) so here we are.

`shitpost` is a toy library that generates types based on basic DDL (and I mean basic), rather than learning a new schema associated with, say, Prisma. It's not really an ORM, and you will probably have to write raw SQL slapped with type casting for more advanced applications.

Uses [postgres](https://github.com/porsager/postgres) under the hood.

## Installation

WIP

## Usage

package.json

```json
{
  "scripts": {
    // migrations are for the weak
    "db:nuke": "shitpost nuke --force",

    // generate typescript models
    "db:generate": "shitpost --output .server/database/models"
  }
}
```

@todo adapters that implement a shared interface for different kinds of postgres clients
