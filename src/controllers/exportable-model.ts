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

    public listen(): void {
        this.exportProcessor.on('modelProcessed', (model: ExportableModel) => {
            try {
                this.exportableModelService.updateModel({
                    ...model,
                    progress: 100,
                    status: 'processed'
                }) 
            } catch(e) {
                this.exportProcessor.terminateProcess(model.id)
            }
        })
        this.exportProcessor.on('modelProcessingInProgress', (model: ExportableModel, percent: number) => {
            try {
                this.exportableModelService.updateModel({
                    ...model,
                    progress: percent,
                    status: 'in-progress'
                }) 
            } catch(e) {
                this.exportProcessor.terminateProcess(model.id)
            }
        })
        this.exportProcessor.on('modelProcessingFailure', (model: ExportableModel) => {
            try {
                this.exportableModelService.updateModel({
                    ...model,
                    progress: 0,
                    status: 'error'
                })
            } catch(e) {
                this.exportProcessor.terminateProcess(model.id)
            }
        })
    }

    public getAll(req: Request, res: Response): void {
        res.send(this.exportableModelService.getAll().map((model: ExportableModel) => {
            delete model.inputFile
            return model
        }))
        res.end()
    }

    public getByID(req: Request, res: Response): void {
        const id = req.params.id
        let model = this.exportableModelService.getById(id)
        delete model.inputFile
        res.send(model)
        res.end()
    }

    public createNewModel(req: Request, res: Response): void {
        const inputFile = req['files'].inputFile[0].path
        const filename = req['files'].inputFile[0].originalFilename
        const format = req['fields'].format[0]
        const extension = this.extractExtension(inputFile)
        if (extension !== 'shapr') {
            throw new APIError('Extension unsupported', 1001)
        }
        switch(format) {
            case 'obj':
            case 'step':
            case 'iges':
            case 'stl': {
                break;
            }
            default: 
                throw new APIError('Unknown format', 1002)
        }
        const model = this.exportableModelService.createModel(filename, inputFile, format)
        this.exportProcessor.scheduleProcessing(model)
        let copy = {
            ...model
        }
        delete copy.inputFile
        res.send(copy)
        res.end()
    }

    private extractExtension(inputFile: string): string {
        return inputFile.split('.').pop();
    }

    public deleteModel(req: Request, res: Response): void {
        const id = req.params.id
        this.exportProcessor.terminateProcess(id)
        this.exportableModelService.deleteModelByID(id)
        res.send({status: true})
        res.end()
    }

    public static get instance(): ExportableModelController {
        if (!this.singleton) {
            const exportableModelService = ExportableModelService.instance
            const exportProcessor = ExportProcessorService.instance
            this.singleton = new ExportableModelController(exportableModelService, exportProcessor)
            this.singleton.listen()
        }
        return this.singleton
    }

}