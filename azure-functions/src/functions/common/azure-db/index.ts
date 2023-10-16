import knex from "knex";

export const connection = knex({
  client: "mssql",
  connection: {
    server: "muuchandb.database.windows.net",
    database: "muuchan",
    user: process.env.AZURE_SQL_USERNAME,
    password: process.env.AZURE_SQL_PASSWORD,
    options: {
      encrypt: true,
    },
  },
});
