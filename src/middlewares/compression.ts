import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as compression  from 'compression'

export class CompressionMiddleware implements Middleware {

    private shouldCompress(req: Request, res: Response): boolean {
        if (req.headers['x-no-compression']) {
          return false
        }
        return compression.filter(req, res)
      } 

    public handle(req: Request, res: Response, next: (error?: Error) => void): void {
        compression({ threshold: 0, filter: this.shouldCompress })(req, res, next)
    }

}