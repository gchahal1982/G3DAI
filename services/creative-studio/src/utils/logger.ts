export class Logger {
    private context: string;

    constructor(context: string = 'CreativeStudio') {
        this.context = context;
    }

    info(message: string, data?: any): void {
        console.log(`[${this.context}] INFO: ${message}`, data || '');
    }

    error(message: string, data?: any): void {
        console.error(`[${this.context}] ERROR: ${message}`, data || '');
    }

    warn(message: string, data?: any): void {
        console.warn(`[${this.context}] WARN: ${message}`, data || '');
    }

    debug(message: string, data?: any): void {
        if (process.env.NODE_ENV === 'development') {
            console.debug(`[${this.context}] DEBUG: ${message}`, data || '');
        }
    }
}