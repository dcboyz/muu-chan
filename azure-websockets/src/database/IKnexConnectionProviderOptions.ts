interface IKnexConnectionOptions {
  server: string;
  database: string;
  user: string;
  password: string;
  table: string;
}

export interface IKnexConnectionProviderOptions {
  client: string;
  connection: IKnexConnectionOptions;
}
