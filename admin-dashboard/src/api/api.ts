import { projectsApi } from './projects'
import { routesApi } from './routes'
import { transformersApi } from './transformers'
import { credentialsApi } from './credentials'
import { logsApi } from './logs'
import { queueApi } from './queue'
import { breakerApi } from './breaker'

export const api = {
  projects: projectsApi,
  routes: routesApi,
  transformers: transformersApi,
  credentials: credentialsApi,
  logs: logsApi,
  queue: queueApi,
  breaker: breakerApi
}
