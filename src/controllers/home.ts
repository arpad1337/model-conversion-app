import { Controller } from './controller'
import { Request, Response } from 'express'

export class HomeController extends Controller {

    protected static singleton: HomeController = null;

    index(req: Request, res: Response) {
        res.send('hello'),
        res.end()
    }

    static get instance(): HomeController {
        if (!this.singleton) {
            this.singleton = new HomeController()
        }
        return this.singleton
    }

}