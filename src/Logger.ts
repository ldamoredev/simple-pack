import kleur, { Color } from 'kleur'

export class KleurLogger implements Logger {
    info(message: string) { this.log('ℹ', kleur.blue, message) }

    warn(message: string) { this.log('⚠', kleur.yellow, message) }

    error(message: string) { this.log('✖', kleur.red, message) }

    success(message: string) { this.log('✔', kleur.green, message) }

    private log(type: string, color: Color, message: string) {
        console.log(color(kleur.bold(type)), message)
    }
}

export interface Logger {
    info: Log
    warn: Log
    success: Log
    error: Log
}

export type Log = (message: string) => void
