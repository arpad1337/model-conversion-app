import { Middleware } from './middleware'
import { LoggingMiddleware } from './logging'

export * from './middleware'
export * from './logging'
export const middlewareMapping = new Map<string, Middleware>([[
    'logging', new LoggingMiddleware()
]]);