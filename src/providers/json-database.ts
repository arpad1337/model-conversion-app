import * as fs from 'fs'
import * as uuid from 'uuid4'
import { HasId } from '../models/has-id'
import { DatabaseProvider } from '../models/database-provider'

export class JSONDatabaseProvider implements DatabaseProvider {

    protected static singleton: JSONDatabaseProvider
    private static readonly STORAGE_FILENAME = '1Kh0H29dexjlUYAu'

    private _DB: any

    constructor() {
        this._DB = {}
    }

    public get DB() {
        return this._DB
    }

    public initialize(): void {
        if (!fs.existsSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`)) {
            this.commit()
        }
        let file
        try {
            file = fs.readFileSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`)
        } catch(e) {
            file = "{}"
        }
        const jsonContents = JSON.parse(file.toString())
        this._DB = jsonContents
    }

    public isSchemaExists(key: string): boolean {
        return !!this._DB[key]
    }

    public createSchema(key: string): void {
        this._DB[key] = []
    }

    public getAllFromSchema(key: string): any[] {
        if (!this._DB[key]) {
            throw new Error('Schema not found')
        }
        return this._DB[key].concat().map((model: any) => {
            return {
                ...model
            }
        })
    }

    public getFromSchemaById(key: string, id: string): any {
        if (!this._DB[key]) {
            throw new Error('Schema not found')
        }
        return {
            ...this._DB[key].find((m: any) => m.id === id)
        }
    }

    public pushToSchema(key: string, model: HasId): any {
        if (!this._DB[key]) {
            throw new Error('Schema not found')
        }
        const copy = {
            ...model
        }
        copy['id'] = uuid()
        this._DB[key].push(copy)
        this.commit()
        return {
            ...copy
        }
    }

    public updateByIdInSchema(key: string, model: HasId): any {
        if (!this._DB[key]) {
            throw new Error('Schema not found')
        }
        const stored = this._DB[key].find((m: any) => m.id === model.id) as HasId
        if (!stored) {
            throw new Error('Model not found')
        }
        for(let property in model) {
            stored[property] = model[property]
        }
        stored.updatedAt = (new Date()).toISOString()
        this.commit()
        return this.getFromSchemaById(key, model.id)
    }

    public deleteFromSchemaById(key: string, id: string): void {
        if (!this._DB[key]) {
            throw new Error('Schema not found')
        }
        const index = this._DB[key].findIndex((m: any) => m.id === id)
        this._DB[key].splice(index, 1)
        this.commit()
    }

    public commit(): void {
        fs.writeFileSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`, JSON.stringify(this._DB))
    }

    public clear(): void {
        this._DB = {}
        try {
            fs.unlinkSync(`./${JSONDatabaseProvider.STORAGE_FILENAME}.json`)
        } catch(e) {

        }
    }

    public static get instance(): JSONDatabaseProvider {
        if (!this.singleton) {
            this.singleton = new JSONDatabaseProvider()
            this.singleton.initialize()
        }
        return this.singleton
    }
    
}