const { JSONDatabaseProvider } = require('../../../dist/providers/json-database')

const { createSpyFromClass } = require('jasmine-auto-spies')

const schema = 'files'
const schemaNotFoundError = new Error('Schema not found')
const modelNotFoundError = new Error('Model not found')
const mockData = require('../test-utils/mock-data')

const getTestPropsFromModel = (model) => {
    const copy = {
        ...model
    }
    delete copy.id
    return copy
}

class FileSystemProviderMock {
    existsSync(_) {
        return false
    }
    readFileSync(_) {
        return {
            toString: () => {
                return "{}"
            }
        }
    }
    writeFileSync(_, _2) {}
    unlinkSync(_) {}
}

describe('JSONDatabaseProvider tests', () => {

    let databaseProvide
    let fileSystemProvider

    beforeEach(() => {
        fileSystemProvider = createSpyFromClass(FileSystemProviderMock)
        databaseProvider = new JSONDatabaseProvider(fileSystemProvider)
        databaseProvider.clear()
        spyOn(databaseProvider, 'commit')
    })

    afterAll(() => {
        databaseProvider.clear()
    })

    it('should initialize', () => {
        databaseProvider.initialize()

        expect(fileSystemProvider.existsSync).toHaveBeenCalled()
        expect(fileSystemProvider.existsSync).toHaveBeenCalledTimes(1)

        expect(databaseProvider.DB).toEqual({})
        expect(databaseProvider.commit).toHaveBeenCalled()
        expect(databaseProvider.commit).toHaveBeenCalledTimes(1)
    })

    it('should return false on isSchemaExists', () => {
        const result = databaseProvider.isSchemaExists(schema)

        expect(result).toEqual(false)
    })

    it('should return true on isSchemaExists if schema created before', () => {
        databaseProvider.createSchema(schema)
        const result = databaseProvider.isSchemaExists(schema)

        expect(result).toEqual(true)
        expect(databaseProvider.DB[schema]).toEqual([])
    })

    it('should throw on getAllFromSchema if schema doesn\'t exists', () => {
        expect(() => {
            databaseProvider.getAllFromSchema(schema)
        }).toThrow(schemaNotFoundError)
    })

    it('should return empty on getAllFromSchema', () => {
        databaseProvider.createSchema(schema)
        const result = databaseProvider.getAllFromSchema(schema)

        expect(result).toEqual([])
    })

    it('should return models on getAllFromSchema if pushed before', () => {
        databaseProvider.createSchema(schema)

        mockData.forEach((model) => {
            databaseProvider.pushToSchema(schema, model)
        })

        const result = databaseProvider.getAllFromSchema(schema).map(getTestPropsFromModel)

        expect(result).toEqual(mockData.map(getTestPropsFromModel))
    })

    it('should throw on getFromSchemaById if schema doesn\'t exists', () => {
        expect(() => {
            databaseProvider.getFromSchemaById(schema, mockData[0].id)
        }).toThrow(schemaNotFoundError)
    })

    it('should return empty on getFromSchemaById', () => {
        databaseProvider.createSchema(schema)
        const result = databaseProvider.getFromSchemaById(schema, mockData[0].id)

        expect(result).toEqual({})
    })

    it('should return model on getFromSchemaById if pushed before', () => {
        databaseProvider.createSchema(schema)

        const storedModel = databaseProvider.pushToSchema(schema, mockData[0])

        const result = databaseProvider.getFromSchemaById(schema, storedModel.id)

        expect(result).toEqual(storedModel)
    })

    it('should throw on pushToSchema if schema doesn\'t exists', () => {
        expect(() => {
            databaseProvider.pushToSchema(schema, mockData[0])
        }).toThrow(schemaNotFoundError)
    })

    it('should return model on pushToSchema', () => {
        databaseProvider.createSchema(schema)

        const storedModel = databaseProvider.pushToSchema(schema, mockData[0])

        expect(getTestPropsFromModel(mockData[0])).toEqual(getTestPropsFromModel(storedModel))
        expect(databaseProvider.commit).toHaveBeenCalled()
        expect(databaseProvider.commit).toHaveBeenCalledTimes(1)
    })

    it('should throw on deleteFromSchemaById if schema doesn\'t exists', () => {
        expect(() => {
            databaseProvider.deleteFromSchemaById(schema, mockData[0].id)
        }).toThrow(schemaNotFoundError)
    })

    it('should pass on deleteFromSchemaById', () => {
        databaseProvider.createSchema(schema)

        databaseProvider.deleteFromSchemaById(schema, mockData[0].id)

        expect(databaseProvider.DB[schema].find((m) => m.id = mockData[0].id)).toEqual(undefined)

        expect(databaseProvider.commit).toHaveBeenCalled()
        expect(databaseProvider.commit).toHaveBeenCalledTimes(1)
    })

    it('should throw on updateByIdInSchema if schema doesn\'t exists', () => {
        expect(() => {
            databaseProvider.updateByIdInSchema(schema, mockData[0])
        }).toThrow(schemaNotFoundError)
    })

    it('should throw on updateByIdInSchema if model doesn\'t exists', () => {
        databaseProvider.createSchema(schema)

        expect(() => {
            databaseProvider.updateByIdInSchema(schema, mockData[0])
        }).toThrow(modelNotFoundError)
    })

    it('should update on updateByIdInSchema', () => {
        databaseProvider.createSchema(schema)

        const storedModel = databaseProvider.pushToSchema(schema, mockData[0])

        const updated = databaseProvider.updateByIdInSchema(schema, {
            ...storedModel,
            status: 'in-progress'
        })

        expect(updated.status).toEqual('in-progress')

        expect(databaseProvider.commit).toHaveBeenCalled()
        expect(databaseProvider.commit).toHaveBeenCalledTimes(2)
    })

})
