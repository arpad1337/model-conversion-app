import { EventEmitter } from "events"

export interface ProcessWrapper extends EventEmitter {
    listen(): void
    kill(): void
}