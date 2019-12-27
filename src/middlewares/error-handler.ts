import { Request, Response } from 'express'
import { APIError } from '../utils'

export class ErrorHandlerMiddleware {

    /* 
     * The Express Framework unfortunatelly uses runtime method signature check when 
     * hooking into this middleware as default error handler. No workaround exists
     */
    handle(error: APIError, _: Request, res: Response, _2: Function) {
        res.status(500)
        res.send(error)
        res.end()
    }

}