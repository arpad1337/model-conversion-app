import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as multiparty from 'multiparty'

export class MultipartParserMiddleware extends Middleware {

    handle(req: Request, res: Response, next: Function) {
        const form = new multiparty.Form()
        form.parse(req, (err: any, fields: any[], files: any[]) => {
            if (err) {
                res.send({
                    error: err.message
                })
                return;
            }
            req['fields'] = fields
            req['files'] = files
            next()
        })
    }

}