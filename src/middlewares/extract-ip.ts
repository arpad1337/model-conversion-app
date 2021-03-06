import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as requestIp  from 'request-ip'

export class ExtractIPMiddleware implements Middleware {

    public handle(req: Request, res: Response, next: (error?: Error) => void): void {
        requestIp.mw()(req, res, next)
    }

}