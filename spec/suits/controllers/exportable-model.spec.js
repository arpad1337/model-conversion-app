const { ExportableModelController } = require('../../../dist/controllers/exportable-model')
const { ExportProcessorService } = require('../../../dist/services/export-processor')
const { ExportableModelService } = require('../../../dist/services/exportable-model')
const { APIError } = require('../../../dist/utils/api-error') 

const responseFactory = require('../test-utils/response-factory')

const mockData = require('../test-utils/mock-data')

const { createSpyFromClass } = require('jasmine-auto-spies')

const removeInputFileProperty = (models) => {
    if (Array.isArray(models)) {
        return models.map((model) => {
            const copy = {
                ...model
            }
            delete copy.inputFile
            return copy
        })
    }
    const copy = {
        ...models
    }
    delete copy.inputFile
    return copy
}

describe('ExportableModelController tests', () => {

    let controller
    let exportProcessor
    let exportableModelService

    beforeEach(() => {
        exportProcessor = createSpyFromClass(ExportProcessorService)
        exportableModelService = createSpyFromClass(ExportableModelService)
        controller = new ExportableModelController(exportableModelService, exportProcessor)
    })

    it('should listen on exportProcessor', () => {
        controller.listen()

        expect(exportProcessor.on).toHaveBeenCalled()
        expect(exportProcessor.on).toHaveBeenCalledTimes(3)
    })

    it('should retrieve models', () => {
        const returnValue = mockData

        const response = responseFactory()
        spyOn(response, 'send')
        spyOn(response, 'end')

        exportableModelService.getAll.and.returnValue(returnValue)

        controller.getAll(undefined, response)

        expect(exportableModelService.getAll).toHaveBeenCalled()
        
        expect(response.send).toHaveBeenCalled()
        expect(response.send).toHaveBeenCalledWith(removeInputFileProperty(returnValue))
        expect(response.send).toHaveBeenCalledTimes(1)
        expect(response.end).toHaveBeenCalled()
        expect(response.end).toHaveBeenCalledTimes(1)
    })

    it('should get one by id', () => {
        const returnValue = mockData[0]

        const response = responseFactory()
        spyOn(response, 'send')
        spyOn(response, 'end')

        exportableModelService.getById.and.returnValue(returnValue)

        const request = {
            params: {
                id: 1
            }
        }

        controller.getById(request, response)

        expect(exportableModelService.getById).toHaveBeenCalled()
        expect(exportableModelService.getById).toHaveBeenCalledTimes(1)
        
        expect(response.send).toHaveBeenCalled()
        expect(response.send).toHaveBeenCalledWith(removeInputFileProperty(returnValue))
        expect(response.send).toHaveBeenCalledTimes(1)
        expect(response.end).toHaveBeenCalled()
        expect(response.end).toHaveBeenCalledTimes(1)
    })

    it('should create new model', () => {
        const formats = ['step', 'iges', 'stl', 'obj']

        const returnValue = mockData[0]

        const response = responseFactory()
        spyOn(response, 'send')
        spyOn(response, 'end')

        exportableModelService.createModel.and.returnValue(returnValue)

        formats.forEach((format) => {
            const request = {
                files: {
                    inputFile: [{
                        originalFilename: 'test.shapr',
                        path: '/tmp/nothing.shapr'
                    }]
                },
                fields: {
                    format: [format]
                }
            }

            controller.createNewModel(request, response)

            expect(exportableModelService.createModel).toHaveBeenCalled()
            expect(exportableModelService.createModel).toHaveBeenCalledWith(
                request.files.inputFile[0].originalFilename, 
                request.files.inputFile[0].path, 
                request.fields.format[0]
            )

            expect(exportProcessor.scheduleProcessing).toHaveBeenCalled()
            expect(exportProcessor.scheduleProcessing).toHaveBeenCalledWith(returnValue)
        })

        expect(exportableModelService.createModel).toHaveBeenCalledTimes(4)

        expect(exportProcessor.scheduleProcessing).toHaveBeenCalledTimes(4)

        expect(response.send).toHaveBeenCalled()
        expect(response.send).toHaveBeenCalledWith(removeInputFileProperty(returnValue))
        expect(response.send).toHaveBeenCalledTimes(4)
        expect(response.end).toHaveBeenCalled()
        expect(response.end).toHaveBeenCalledTimes(4)
    })

    it('should throw on unsupported format', () => {
        const request = {
            files: {
                inputFile: [{
                    originalFilename: 'test.shapr',
                    path: '/tmp/nothing.unsupported'
                }]
            },
            fields: {
                format: ['iges']
            }
        }

        expect(() => {
            controller.createNewModel(request)
        }).toThrow(new APIError('Extension unsupported', 1001))
    })

    it('should throw on unknown output format', () => {
        const request = {
            files: {
                inputFile: [{
                    originalFilename: 'test.shapr',
                    path: '/tmp/nothing.shapr'
                }]
            },
            fields: {
                format: ['unknown']
            }
        }

        expect(() => {
            controller.createNewModel(request)
        }).toThrow(new APIError('Unknown format', 1002))
    })

    it('should delete model', () => {
        const response = responseFactory()
        spyOn(response, 'send')
        spyOn(response, 'end')

        const request = {
            params: {
                id: 1
            }
        }

        controller.deleteModel(request, response)

        expect(exportProcessor.terminateProcess).toHaveBeenCalled()
        expect(exportProcessor.terminateProcess).toHaveBeenCalledTimes(1)
        expect(exportProcessor.terminateProcess).toHaveBeenCalledWith(request.params.id)

        expect(exportableModelService.deleteModelById).toHaveBeenCalled()
        expect(exportableModelService.deleteModelById).toHaveBeenCalledTimes(1)
        expect(exportableModelService.deleteModelById).toHaveBeenCalledWith(request.params.id)

        expect(response.send).toHaveBeenCalled()
        expect(response.send).toHaveBeenCalledWith({status: true})
        expect(response.send).toHaveBeenCalledTimes(1)
        expect(response.end).toHaveBeenCalled()
        expect(response.end).toHaveBeenCalledTimes(1)
    })

})