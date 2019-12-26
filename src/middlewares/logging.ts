import { Middleware } from './middleware'
import { Request, Response } from 'express'

export class LoggingMiddleware extends Middleware {

    handle(req: Request, res: Response, next: Function) {
        console.log(req['clientIp'], "\t", req.path, "\t", req.method, "\t", (new Date()).toISOString())
        next()
    }

}