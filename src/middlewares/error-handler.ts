import { Middleware } from './middleware'
import { Request, Response } from 'express'

export class ErrorHandlerMiddleware extends Middleware {

    handle(req: Request, res: Response, next: Function) {
        try {
            next() 
        } catch(e) {
            res.send({
                error: e.message
            })
            res.end()
        }
    }

}