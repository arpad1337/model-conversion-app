import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as multiparty from 'multiparty'

export class MultipartParserMiddleware implements Middleware {

    promisifyUpload(req): Promise<[any[], any[]]> {
        return new Promise((resolve, reject) => {
            const form = new multiparty.Form()
            form.parse(req, (err, fields, files) => {
                if (err) {
                    return reject(err)
                }
                return resolve([fields, files])
            });
        });
    }

    async handle(req: Request, res: Response, next: Function) {
        try {
            const [fields, files] = await this.promisifyUpload(req)
            req['fields'] = fields
            req['files'] = files
            next()
        } catch(e) {
            next(e)
        }
    }

}