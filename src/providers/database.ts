import * as fs from 'fs'
import * as uuid from 'uuid4'

export interface HasID {
    id: string
}

export class DatabaseProvider {

    private static singleton: DatabaseProvider = null
    private static readonly STORAGE_FILE_NAME = '1Kh0H29dexjlUYAu'
    private DB: any = {}

    public initialize(): void {
        if (!fs.existsSync(`./${DatabaseProvider.STORAGE_FILE_NAME}.json`)) {
            this.commit()
        }
        const file = fs.readFileSync(`./${DatabaseProvider.STORAGE_FILE_NAME}.json`)
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

    public pushToSchema(key: string, model: any): any {
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
        const stored = this.DB[key].find((m: any) => m.id === model.id)
        for(let property in model) {
            stored[property] = model[property]
        }
        this.commit()
        return this.getFromSchemaByID(key, model.id)
    }

    public deleteFromSchemaById(key: string, id: string) {
        if (!this.DB[key]) {
            throw new Error('Schema not found')
        }
        const index = this.DB[key].findIndex((m: any) => m.id === id)
        this.DB[key].splice(index, 1)
        this.commit()
    }

    public commit(): void {
        fs.writeFileSync(`./${DatabaseProvider.STORAGE_FILE_NAME}.json`, JSON.stringify(this.DB))
    }

    static get instance(): DatabaseProvider {
        if (!this.singleton) {
            this.singleton = new DatabaseProvider()
            this.singleton.initialize()
        }
        return this.singleton
    }
    
}