import { Compiler } from './Compiler'
import path from 'path'
import kleur from 'kleur'
import del from 'del'
import { Logger } from './Logger'

export class CommonJS {
    constructor(private compiler: Compiler, private logger: Logger) {
    }

    async build(config: CommonJSConfig) {
        this.logger.info(`Cleaning up previous build at ${kleur.blue(path.relative(config.root, config.output))}`)
        await del([config.output])
        await this.compiler.compile({ ...config, modules: 'commonjs', field: 'main' })
    }
}

interface CommonJSConfig {
    root: string
    source: string
    output: string
    babelrc?: boolean | null
    configFile?: string | false | null
    sourceMaps?: boolean
    copyFlow?: boolean
}
