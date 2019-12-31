import { Middleware } from './middleware'
import { Request, Response } from 'express'
import * as multiparty from 'multiparty'

export class MultipartParserMiddleware implements Middleware {

    private promisifyUpload(req): Promise<[any[], any[]]> {
        return new Promise((resolve, reject) => {
            const form = new multiparty.Form()
            form.parse(req, (err, fields, files) => {
                if (err) {
                    reject(err)
                    return
                }
                resolve([fields, files])
            });
        });
    }

    public async handle(req: Request, res: Response, next: (error?: Error) => void): Promise<void> {
        try {
            const [fields, files]: [any[], any[]] = await this.promisifyUpload(req)
            req['fields'] = fields
            req['files'] = files
            next()
        } catch(e) {
            next(e)
        }
    }

}