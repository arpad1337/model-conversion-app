import { Request, Response } from 'express'

export interface MiddlewareHandler {
    (req?: Request, res?: Response, next?: Function): Promise<void> | void
}

export interface Middleware {
    handle: MiddlewareHandler
}