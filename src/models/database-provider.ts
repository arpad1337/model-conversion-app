import { HasID } from './has-id'

export interface DatabaseProvider {
    isSchemaExists(key: string): boolean
    createSchema(key: string): void
    getAllFromSchema(key: string): any[]
    getFromSchemaByID(key: string, id: string): any
    pushToSchema(key: string, model: any): any
    updateByIdInSchema(key: string, model: HasID): any
    deleteFromSchemaById(key: string, id: string): void
    commit(): void
}