import { ChildProcessProvider } from "./child-process"
import { ProcessProvider as ProcessProviderInterface } from '../models/process-provider'

export class ProcessProvider {
    public static get instance(): ProcessProviderInterface {
        /*
         * This makes us able to switch between implementations runtime
         */
        return ChildProcessProvider.instance
    }
}