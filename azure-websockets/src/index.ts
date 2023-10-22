import 'reflect-metadata'

import dotenv from 'dotenv'
import Container from 'typedi'

dotenv.config()

import { Application } from './Application'

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  application.handleCron()

  await application.listenToCommands()
})()
