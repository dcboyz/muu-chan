export interface IKnexConnectionProviderOptions {
  client: string
  connection: {
    server: string
    database: string
    user: string
    password: string
    table: string
  }
}
