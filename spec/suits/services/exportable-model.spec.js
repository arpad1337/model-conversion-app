const { ExportableModelService } = require('../../../dist/services/exportable-model')
const { JSONDatabaseProvider } = require('../../../dist/providers/json-database')

const { createSpyFromClass } = require('jasmine-auto-spies')

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

})