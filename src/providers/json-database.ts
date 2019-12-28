import * as fs from 'fs'
import * as uuid from 'uuid4'
import { HasID } from '../models/has-id'
import { DatabaseProvider } from '../models/database-provider'

export class JSONDatabaseProvider implements DatabaseProvider {

    protected static singleton: JSONDatabaseProvider
    private static readonly STORAGE_FILENAME = '1Kh0H29dexjlUYAu'

    private DB: any

    constructor() {
        this.DB = {}
    }

    public initialize(): void {
        if (!fs.existsSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`)) {
            this.commit()
        }
        const file = fs.readFileSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`)
        const jsonContents = JSON.parse(file.toString())
        this.DB = jsonContents || {}
    }

    public isSchemaExists(key: string): boolean {
        return !!this.DB[key]
    }

    public createSchema(key: string): void {
        this.DB[key] = []
    }

    public getAllFromSchema(key: string): any[] {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        return this.DB[key].concat().map((model: any) => {
            return {
                ...model
            }
        })
    }

    public getFromSchemaByID(key: string, id: string): any {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        return {
            ...this.DB[key].find((m: any) => m.id === id)
        }
    }

    public pushToSchema(key: string, model: HasID): any {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        const copy = {
            ...model
        }
        copy['id'] = uuid()
        this.DB[key].push(copy)
        this.commit()
        return {
            ...copy
        }
    }

    public updateByIdInSchema(key: string, model: HasID): any {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        const stored = this.DB[key].find((m: any) => m.id === model.id) as HasID
        if (!stored) {
            throw new Error('Model not found')
        }
        for(let property in model) {
            stored[property] = model[property]
        }
        stored.updatedAt = (new Date()).toISOString()
        this.commit()
        return this.getFromSchemaByID(key, model.id)
    }

    public deleteFromSchemaById(key: string, id: string): void {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        const index = this.DB[key].findIndex((m: any) => m.id === id)
        this.DB[key].splice(index, 1)
        this.commit()
    }

    public commit(): void {
        fs.writeFileSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`, JSON.stringify(this.DB))
    }

    public clear(): void {
        this.DB = {}
        this.commit()
    }

    public static get instance(): JSONDatabaseProvider {
        if (!this.singleton) {
            this.singleton = new JSONDatabaseProvider()
            this.singleton.initialize()
        }
        return this.singleton
    }
    
}