import { BabelTranspiler } from '../transpiler/babelTranspiler/BabelTranspiler'
import path from 'path'
import kleur from 'kleur'
import del from 'del'
import { Logger } from '../Logger'

export class CommonJS {
    constructor(private transpiler: BabelTranspiler, private logger: Logger) {
    }

    async build(config: CommonJSConfig) {
        this.logger.info(`Cleaning up previous build at ${kleur.blue(path.relative(config.root, config.output))}`)
        await del([config.output])
        await this.transpiler.transform({ ...config, modules: 'commonjs', field: 'main' })
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
