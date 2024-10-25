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

type UserData = {
  id: number;
  username: string;
  password: string;
};

type PostData = {
  id: number;
  title: string | null;
  body: string;
  userId: UserData["id"];
};

type Database = {
  user_: UserData;
  post_: PostData;
};

// use proxies to auto get database keys

export function database() {
  return {
    user: {
      select(columns: Array<keyof UserData>) {
        return {
          where() {},
        };
      },
    },
    // select(column: Array<keyof Database>) {
    //   return {
    //     from(tableName: Table) {
    //       return {
    //         where() {},
    //       };
    //     },
    //   };
    // },
  };
}
