import { Middleware } from './middleware'
import { Request, Response } from 'express'

export class LoggingMiddleware implements Middleware {

    public handle(req: Request, _: Response, next: (error?: Error) => void): void {
        console.log(req['clientIp'], "\t", req.path, "\t", req.method, "\t", (new Date()).toISOString())
        next()
    }

}