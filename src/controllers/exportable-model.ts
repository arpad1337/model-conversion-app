import { Controller } from './controller'
import { Request, Response } from 'express'
import { ExportableModelService } from '../services/exportable-model';

export class ExportableModelController extends Controller {

    protected static singleton: ExportableModelController = null;

    private exportableModelService: ExportableModelService

    constructor(exportableModelService: ExportableModelService) {
        super()
        this.exportableModelService = exportableModelService
    }

    getAll(req: Request, res: Response) {
        res.send(this.exportableModelService.getAll())
        res.end()
    }

    getByID(req: Request, res: Response) {
        const id = req.params.id
        res.send(this.exportableModelService.getById(id))
        res.end()
    }

    createNewModel(req: Request, res: Response) {
        const inputFile = req['files'].inputFile[0].path
        const format = req['fields'].format[0]
        const model = this.exportableModelService.createFile(inputFile, format)
        res.send(model)
        res.end()
    }

    static get instance(): ExportableModelController {
        if (!this.singleton) {
            const exportableModelService = ExportableModelService.instance
            this.singleton = new ExportableModelController(exportableModelService)
        }
        return this.singleton
    }

}