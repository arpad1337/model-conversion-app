import { Request, Response } from 'express'

export class Middleware {

    handle(req: Request, res: Response, next: Function) {
        next()
    }

}