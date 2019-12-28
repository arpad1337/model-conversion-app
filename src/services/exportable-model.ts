import { ExportableModel } from '../models/exportable-model'
import { FileFormat } from 'model-conversion-async/src/lib/file-converter'
import { DatabaseProvider as DatabaseProviderGetter } from '../providers/database'
import { DatabaseProvider } from '../models/database-provider'

import * as crypto from 'crypto'

export class ExportableModelService {

    protected static singleton: ExportableModelService = null
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
        const newModel = this.databaseProvider.pushToSchema(ExportableModelService.COLLECTION_ID, model) as ExportableModel
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
            const databaseProvider = DatabaseProviderGetter.instance
            this.singleton = new ExportableModelService(databaseProvider)
            this.singleton.setup()
        }
        return this.singleton
    }

}