import { DatabaseProvider } from '../providers/database'
import { FileFormat } from 'model-conversion-async/src/lib/file-converter'
import * as crypto from 'crypto'

export type FileStatus = 'waiting' | 'in-progress' | 'processed' | 'error'

export interface ExportableModel {
    inputFile: string
    progress: number
    outputFile: string
    format: FileFormat
    status: FileStatus
    id: string
    filename: string 
    createdAt: string
    updatedAt: string
}

export class ExportableModelService {

    private static singleton: ExportableModelService = null
    private static readonly COLLECTION_ID = 'files'

    private databaseProvider: DatabaseProvider

    constructor(databaseProvider: DatabaseProvider) {
        this.databaseProvider = databaseProvider
    }

    public setup() {
        if (!this.databaseProvider.isSchemaExists(ExportableModelService.COLLECTION_ID)) {
            this.databaseProvider.createSchema(ExportableModelService.COLLECTION_ID)
            this.databaseProvider.commit()
        }
    }

    public getAll(): ExportableModel[] {
        return this.databaseProvider.getAllFromSchema(ExportableModelService.COLLECTION_ID) as ExportableModel[]
    }

    public getById(id: string): ExportableModel {
        return this.databaseProvider.getFromSchemaByID(ExportableModelService.COLLECTION_ID, id) as ExportableModel
    }

    public createModel(filename: string, inputFile: string, format: FileFormat): ExportableModel {
        const outputFile = crypto.createHash("sha256")
            .update(filename + (new Date()).toISOString())
            .digest("hex") + '.' + format
        const model: ExportableModel = {
            format: format,
            inputFile: inputFile,
            outputFile: './exports/' + outputFile,
            progress: 0,
            status: 'waiting',
            id: null,
            filename: filename,
            createdAt: (new Date()).toISOString(),
            updatedAt: (new Date()).toISOString()

        }
        const newModel = this.databaseProvider.pushToSchema(ExportableModelService.COLLECTION_ID, model)
        return newModel
    }

    public updateModel(model: ExportableModel): ExportableModel {
        return this.databaseProvider.updateByIdInSchema(ExportableModelService.COLLECTION_ID, model) as ExportableModel
    }

    public deleteModelByID(id: string): void {
        this.databaseProvider.deleteFromSchemaById(ExportableModelService.COLLECTION_ID, id)
    }

    public static get instance(): ExportableModelService {
        if (!this.singleton) {
            const databaseProvider = DatabaseProvider.instance
            this.singleton = new ExportableModelService(databaseProvider)
            this.singleton.setup()
        }
        return this.singleton
    }

}