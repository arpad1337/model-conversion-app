import { Controller } from './controller'
import { Request, Response } from 'express'

export class NetworkStatusController extends Controller {

    protected static singleton: NetworkStatusController

    public echo(req: Request, res: Response) {
        res.send('reply')
        res.end()
    }

    public static get instance(): NetworkStatusController {
        if (!this.singleton) {
            this.singleton = new NetworkStatusController()
        }
        return this.singleton
    }

}