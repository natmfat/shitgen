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

// @todo joins, don't do 4 now for simplicity

type UserData = {
  id: number;
  username: string;
  password: string;
  random: string | null;
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

export class UserModel {
  static create(data: Partial<UserData>) {}

  static read(
    args: Partial<{
      select: Array<keyof UserData>;
      where: Partial<{
        [Key in keyof UserData]: Partial<
          NonNullable<UserData[Key]> extends string
            ? WhereOperatorString<IsNotNullable<UserData[Key]>>
            : NonNullable<UserData[Key]> extends number
            ? WhereOperatorNumber<IsNotNullable<UserData[Key]>>
            : NonNullable<UserData[Key]> extends boolean
            ? WhereOperatorBoolean<IsNotNullable<UserData[Key]>>
            : unknown
        >;
      }>;
    }>
  ) {}

  // type Nullable<T> = { [K in keyof T]: T[K] | null };

  static update(data: Partial<UserData>, where: {}) {}

  static delete(where: {}) {}
}

// https://www.w3schools.com/sql/sql_like.asp

UserModel.read({
  where: {
    username: "hello",
    random: null,
  },
});
