import { Request, Response } from 'express'

export interface MiddlewareHandler {
    (req: Request, res: Response, next: Function): void | Promise<any>
}

export interface Middleware {
    handle: MiddlewareHandler
}