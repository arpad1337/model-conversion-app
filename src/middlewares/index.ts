import { Middleware } from './middleware'
import { LoggingMiddleware } from './logging'
import { ExtractIPMiddleware } from './extract-ip'
import { MultipartParserMiddleware } from './multipart-parser'
import { CompressionMiddleware } from './compression'

export * from './middleware'
export * from './logging'
export * from './extract-ip'
export * from './multipart-parser'
export * from './error-handler'
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
        'compression', new CompressionMiddleware()
    ]
]);