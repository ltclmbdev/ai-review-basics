import { analyticsSample } from './analytics'
import { formatUtilsSample } from './format-utils'
import { ordersApiSample } from './orders-api'
import type { Sample } from './types'
import { userProfileSample } from './user-profile'

export type { Sample } from './types'

export const samples: Sample[] = [
  userProfileSample,
  ordersApiSample,
  analyticsSample,
  formatUtilsSample,
]
