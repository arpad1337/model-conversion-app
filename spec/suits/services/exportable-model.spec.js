const { ExportableModelService } = require('../../../dist/services/exportable-model')
const { JSONDatabaseProvider } = require('../../../dist/providers/json-database')

const { createSpyFromClass } = require('jasmine-auto-spies')

const mockData = require('../test-utils/mock-data')

const getTestPropsFromModel = (model) => {
    return {
        filename: model.filename,
        inputFile: model.inputFile,
        format: model.format
    }
}

describe('ExportableModelService tests', () => {

    let service
    let databaseProvider

    beforeEach(() => {
        databaseProvider = createSpyFromClass(JSONDatabaseProvider)
        service = new ExportableModelService(databaseProvider)
    })

    it('should create schema on setup', () => {
        databaseProvider.isSchemaExists.and.returnValue(false)

        service.setup()

        expect(databaseProvider.isSchemaExists).toHaveBeenCalled()
        expect(databaseProvider.isSchemaExists).toHaveBeenCalledTimes(1)

        expect(databaseProvider.createSchema).toHaveBeenCalled()
        expect(databaseProvider.createSchema).toHaveBeenCalledTimes(1)
        expect(databaseProvider.createSchema).toHaveBeenCalledWith(ExportableModelService.COLLECTION_ID)

        expect(databaseProvider.commit).toHaveBeenCalled()
        expect(databaseProvider.commit).toHaveBeenCalledTimes(1)
    })

    it('should call database provider on getAll', () => {
        service.getAll()

        expect(databaseProvider.getAllFromSchema).toHaveBeenCalled()
        expect(databaseProvider.getAllFromSchema).toHaveBeenCalledTimes(1)
        expect(databaseProvider.getAllFromSchema).toHaveBeenCalledWith(ExportableModelService.COLLECTION_ID)
    })

    it('should call database provider on getById', () => {
        service.getById(mockData[0].id)

        expect(databaseProvider.getFromSchemaById).toHaveBeenCalled()
        expect(databaseProvider.getFromSchemaById).toHaveBeenCalledTimes(1)
        expect(databaseProvider.getFromSchemaById).toHaveBeenCalledWith(ExportableModelService.COLLECTION_ID, mockData[0].id)
    })

    it('should call database provider on updateModel', () => {
        service.updateModel(mockData[0])

        expect(databaseProvider.updateByIdInSchema).toHaveBeenCalled()
        expect(databaseProvider.updateByIdInSchema).toHaveBeenCalledTimes(1)
        expect(databaseProvider.updateByIdInSchema).toHaveBeenCalledWith(ExportableModelService.COLLECTION_ID, mockData[0])
    })

    it('should call database provider on updateModel', () => {
        service.deleteModelById(mockData[0].id)

        expect(databaseProvider.deleteFromSchemaById).toHaveBeenCalled()
        expect(databaseProvider.deleteFromSchemaById).toHaveBeenCalledTimes(1)
        expect(databaseProvider.deleteFromSchemaById).toHaveBeenCalledWith(ExportableModelService.COLLECTION_ID, mockData[0].id)
    })

    it('should create model', () => {
        const filename = 'test.shapr'
        const inputFile = '/tmp/test.shapr'
        const format = 'iges'

        const propsToMatch = {
            filename,
            inputFile,
            format
        }

        const copy = {
            ...mockData,
            ...propsToMatch
        }

        databaseProvider.pushToSchema.and.returnValue(copy)

        const newModel = service.createModel(filename, inputFile, format)

        expect(databaseProvider.pushToSchema).toHaveBeenCalled()
        expect(databaseProvider.pushToSchema).toHaveBeenCalledTimes(1)
        expect(getTestPropsFromModel(newModel)).toEqual(propsToMatch)
    })

})