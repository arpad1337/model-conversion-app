import { Middleware } from './middleware'
import { LoggingMiddleware } from './logging'
import { ExtractIPMiddleware } from './extract-ip'

export * from './middleware'
export * from './logging'
export const middlewareMapping = new Map<string, Middleware>([
    [
        'logging', new LoggingMiddleware()
    ],
    [
        'extract-ip', new ExtractIPMiddleware()
    ]
]);