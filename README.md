# shitpost

Stands for "shit PostgreSQL type generator", but I couldn't miss the opportunity so here we are.

A toy library for people who don't want to use a ORM but do want basic typed models. Made for rapid prototyping - you should probably just use Supabase instead, which uses PostgreSQL and can generate types.

## Usage

package.json

```
{
  "scripts": {
    "db:generate": "shitpost generate",
  }
}
```
