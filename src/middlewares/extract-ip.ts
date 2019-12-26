import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as requestIp  from 'request-ip'

export class ExtractIPMiddleware extends Middleware {

    handle(req: Request, res: Response, next: Function) {
        requestIp.mw()(req, res, next);
    }

}