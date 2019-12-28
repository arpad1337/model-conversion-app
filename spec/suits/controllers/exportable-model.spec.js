const { ExportableModelController } = require('../../../dist/controllers/exportable-model')
const { ExportProcessorService } = require('../../../dist/services/export-processor')
const { ExportableModelService } = require('../../../dist/services/exportable-model')

const response = require('../test-utils/response')

const { createSpyFromClass } = require('jasmine-auto-spies')

describe('NetworkStatusController tests', () => {

    let controller
    let exportProcessor
    let exportableModelService

    beforeEach(() => {
        exportProcessor = createSpyFromClass(ExportProcessorService)
        exportableModelService = createSpyFromClass(ExportableModelService)
        controller = new ExportableModelController(exportableModelService, exportProcessor)
        spyOn(response, 'send')
        spyOn(response, 'end')
    })

    it('should listen on exportProcessor', () => {
        controller.listen()

        expect(exportProcessor.on).toHaveBeenCalled()
        expect(exportProcessor.on).toHaveBeenCalledTimes(3)
    })

})