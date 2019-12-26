export class APIError extends Error {

    private code: number

    constructor(message, code) {
        super()
        this.message = message
        this.code = code
    }
    
}