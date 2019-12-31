import { Request, Response } from 'express'

export interface MiddlewareHandler {
    (req?: Request, res?: Response, next?: (error?: Error) => void): Promise<void> | void
}

export interface Middleware {
    handle: MiddlewareHandler
}