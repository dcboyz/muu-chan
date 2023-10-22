import 'reflect-metadata'

import * as applicationInsights from 'applicationinsights'

applicationInsights
  .setup(process.env.APPLICATIONINSIGHTS_CONNECTION_STRING)
  .setDistributedTracingMode(applicationInsights.DistributedTracingModes.AI_AND_W3C)
  .setSendLiveMetrics(true)
  .start()

import Container from 'typedi'

import { Application } from './Application'

void (async function main() {
  const application = Container.get(Application)

  application.handleHttpRequests()

  application.handleCron()

  await application.listenToCommands()
})()
