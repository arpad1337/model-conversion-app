import { HasId } from './has-id'

export interface DatabaseProvider {
    isSchemaExists(key: string): boolean
    createSchema(key: string): void
    getAllFromSchema(key: string): any[]
    getFromSchemaByID(key: string, id: string): any
    pushToSchema(key: string, model: HasId): any
    updateByIdInSchema(key: string, model: HasId): any
    deleteFromSchemaById(key: string, id: string): void
    commit(): void
    clear(): void
}