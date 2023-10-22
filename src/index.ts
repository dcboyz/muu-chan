import 'reflect-metadata'

import Container from 'typedi'

import { Application } from './Application'

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  application.handleCron()

  await application.listenToCommands()
})()
