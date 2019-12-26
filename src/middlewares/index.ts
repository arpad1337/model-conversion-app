import { Middleware } from './middleware'
import { LoggingMiddleware } from './logging'
import { ExtractIPMiddleware } from './extract-ip'
import { MultipartParserMiddleware } from './multipart-parser'
import { ErrorHandlerMiddleware } from './error-handler'

export * from './middleware'
export * from './logging'
export const middlewareMapping = new Map<string, Middleware>([
    [
        'logging', new LoggingMiddleware()
    ],
    [
        'extract-ip', new ExtractIPMiddleware()
    ],
    [
        'multipart-parser', new MultipartParserMiddleware()
    ],
    [
        'error-handler', new ErrorHandlerMiddleware()
    ]
]);