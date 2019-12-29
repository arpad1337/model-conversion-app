import { JSONDatabaseProvider } from './json-database'
import { DatabaseProvider as DatabaseProviderInterface } from '../models/database-provider'

export class DatabaseProvider {

    public static get instance(): DatabaseProviderInterface {
        /*
         * This makes us able to switch between implementations runtime
         */
        return JSONDatabaseProvider.instance
    }
    
}