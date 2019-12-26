import { Controller } from './controller'
import { Request, Response } from 'express'
import { ExportableModelService, ExportableModel } from '../services/exportable-model';
import { APIError } from '../utils';
import { ExportProcessorService } from '../services/export-processor';

export class ExportableModelController extends Controller {

    protected static singleton: ExportableModelController = null;

    private exportableModelService: ExportableModelService
    private exportProcessor: ExportProcessorService

    constructor(
        exportableModelService: ExportableModelService,
        exportProcessor: ExportProcessorService
    ) {
        super()
        this.exportableModelService = exportableModelService
        this.exportProcessor = exportProcessor
    }

    listen(): void {
        this.exportProcessor.on('modelProcessed', (model: ExportableModel) => {
            model.status = 'processed'
            model.progress = 100
            this.exportableModelService.updateModel({
                ...model,
                progress: 100,
                status: 'processed'
            })
        })
        this.exportProcessor.on('modelProcessingInProgress', (model: ExportableModel, percent) => {
            this.exportableModelService.updateModel({
                ...model,
                progress: percent,
                status: 'in-progress'
            })
        })
        this.exportProcessor.on('modelProcessingFailure', (model: ExportableModel) => {
            this.exportableModelService.updateModel({
                ...model,
                progress: 0,
                status: 'error'
            })
        })
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

    createNewModel(req: Request, res: Response, next: Function) {
        const inputFile = req['files'].inputFile[0].path
        const format = req['fields'].format[0]
        switch(format) {
            case 'obj':
            case 'step':
            case 'iges':
            case 'stl': {
                break;
            }
            default: 
                throw new APIError('Unknown format', 1001)
        }
        const model = this.exportableModelService.createModel(inputFile, format)
        this.exportProcessor.scheduleProcessing(model)
        res.send(model)
        res.end()
    }

    static get instance(): ExportableModelController {
        if (!this.singleton) {
            const exportableModelService = ExportableModelService.instance
            const exportProcessor = ExportProcessorService.instance
            this.singleton = new ExportableModelController(exportableModelService, exportProcessor)
            this.singleton.listen()
        }
        return this.singleton
    }

}