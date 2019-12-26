import { DatabaseProvider } from '../providers/database'
import { FileFormat } from 'model-conversion-async/src/lib/file-converter'
import * as crypto from 'crypto'

export type FileStatus = 'waiting' | 'in-progress' | 'processed'

export interface ExportableModel {
    inputFile: string
    progress: number
    outputFile: string
    format: FileFormat
    status: FileStatus
}

export class ExportableModelService {

    private static singleton: ExportableModelService = null
    private static readonly COLLECTION_ID = 'files'

    private databaseProvider: DatabaseProvider

    constructor(databaseProvider: DatabaseProvider) {
        this.databaseProvider = databaseProvider
        this.setup()
    }

    private setup() {
        if (!this.databaseProvider.isSchemaExists(ExportableModelService.COLLECTION_ID)) {
            this.databaseProvider.createSchema(ExportableModelService.COLLECTION_ID)
            this.databaseProvider.commit()
        }
    }

    public getAll(): ExportableModel[] {
        return this.databaseProvider.getAllFromSchema(ExportableModelService.COLLECTION_ID)as ExportableModel[]
    }

    public getById(id: string): ExportableModel {
        return this.databaseProvider.getFromSchemaByID(ExportableModelService.COLLECTION_ID, id)as ExportableModel
    }

    public createFile(inputFile: string, format: FileFormat): ExportableModel {
        const outputFile = crypto.createHash("sha256")
            .update(inputFile + (new Date()).toISOString)
            .digest("hex") + '.' + format
        const model: ExportableModel = {
            format: format,
            inputFile: inputFile,
            outputFile: outputFile,
            progress: 0,
            status: 'waiting'
        }
        this.databaseProvider.pushToSchema(ExportableModelService.COLLECTION_ID, model)
        return model
    }

    static get instance(): ExportableModelService {
        if (!this.singleton) {
            const databaseProvider = DatabaseProvider.instance
            this.singleton = new ExportableModelService(databaseProvider)
        }
        return this.singleton
    }

}