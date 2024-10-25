/*
{
  where: {
    username: {
      equals: value
    }
  }
}
*/

// export const columns = ["id", "username", "password", "name"] as const
// export const tableNames = ["users"] as const

// type Column = typeof columns[number]
// type Table = typeof tableNames[number]

import postgres from "postgres";

const sql = postgres();

type UserData = {
  id: number;
  username: string;
  password: string;
  random: string | null;
  avatar_id: number;
};

type AvatarData = {
  id: number;
  src: string;
  alt: string;
};

type UserRelationship = {
  avatar_id: AvatarData;
};

type NonNullValue<NonNull extends true | false, value> = NonNull extends true
  ? value
  : value | null;

type WhereOperatorString<NonNull extends true | false> =
  | {
      eq: NonNullValue<NonNull, string>;
      neq: NonNullValue<NonNull, string>;
      contains: string;
      endsWith: string;
      startsWith: string;
    }
  | NonNullValue<NonNull, string>;

type WhereOperatorNumber<NonNull extends true | false> =
  | {
      eq: NonNullValue<NonNull, number>;
      neq: NonNullValue<NonNull, number>;
      gt: number;
      lt: number;
      gte: number;
      lte: number;
      between: [number, number];
    }
  | NonNullValue<NonNull, number>;

type WhereOperatorBoolean<NonNull extends true | false> =
  | {
      eq: NonNullValue<NonNull, boolean>;
      neq: NonNullValue<NonNull, boolean>;
    }
  | NonNullValue<NonNull, boolean>;

// I have no idea what I'm doing but this appears to work
// T extends null will result in "boolean" instead of true for some reason (perhaps because T extends unknown | null??)
// but false works just fine, so we check for that and "force" the "boolean" into a "true"
type IsNotNullable<T> = (T extends null ? true : false) extends false
  ? true
  : false;

// Relationships will have some of Data's keys, leading to another, different Data type
type BaseRelationship<Data> = Partial<Record<keyof Data, unknown>>;

// this "maps" a type of a value of Data to a the corresponding operators
// prettier-ignore
type WhereOperatorMap<Value> = NonNullable<Value> extends string
  ? WhereOperatorString<IsNotNullable<Value>>
  : NonNullable<Value> extends number
    ? WhereOperatorNumber<IsNotNullable<Value>>
    : NonNullable<Value> extends boolean
      ? WhereOperatorBoolean<IsNotNullable<Value>>
      : never;

type WhereOperator<
  Data,
  Relationship extends BaseRelationship<Data>
> = Partial<{
  [Key in keyof Data]: Partial<WhereOperatorMap<Data[Key]>>;
}> &
  Partial<{
    // this feels redundant but I guess we have to reaffirm Key is a keyof Data?
    // I
    [Key in keyof Relationship extends infer _ ? keyof Data : never]:
      | Data[Key]
      | Partial<{
          [SubKey in keyof Relationship[Key]]: WhereOperatorMap<
            Relationship[Key][SubKey]
          >;
        }>;
  }>;

type IncludeOperator<
  Data,
  Relationship extends BaseRelationship<Data>
> = Partial<{
  [Key in keyof Relationship]:
    | boolean
    | Partial<{
        [SubKey in keyof Relationship[Key]]: boolean;
      }>;
}>;

type DataArgs<Data> = Partial<Data>;

type ReadArgs<Data, Relationship extends BaseRelationship<Data>> = Partial<{
  select: Array<keyof Data>;
  where: WhereOperator<Data, Relationship>;
  include: IncludeOperator<Data, Relationship>;
}>;

export class UserModel {
  static create(data: DataArgs<UserData>) {}

  static read(args: ReadArgs<UserData, UserRelationship>) {}

  static update(
    data: DataArgs<UserData>,
    where: WhereOperator<UserData, UserRelationship>
  ) {}

  static delete(where: WhereOperator<UserData, UserRelationship>) {}
}

// https://www.w3schools.com/sql/sql_like.asp

UserModel.read({
  where: {
    username: "hello",
    random: null,
    avatar_id: 1,
  },
  include: {
    avatar_id: {
      id: true,
    },
  },
});
