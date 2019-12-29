import { Request, Response } from 'express'
import { APIError } from '../utils'

export class ErrorHandlerMiddleware {

    /* 
     * The Express Framework unfortunatelly uses runtime method signature check when 
     * hooking into this middleware as default error handler. No workaround exists
     */
    public handle(error: APIError, _: Request, res: Response, _2: Function): void {
        res.status(500)
        res.send(error)
        res.end()
    }

}