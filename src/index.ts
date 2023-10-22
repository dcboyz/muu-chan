import 'reflect-metadata'

import Container from 'typedi'

// Enable for local development
// dotenv.config()

import { Application } from './Application'

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  application.handleCron()

  await application.listenToCommands()
})()
