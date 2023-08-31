import path from 'path'
import { glob } from 'glob'
import kleur from 'kleur'
import { Logger } from '../../Logger'
import { Babel } from './Babel'

export class BabelTranspiler {
    constructor(private babel: Babel, private logger: Logger) {
    }

    async transform(config: TranspilerConfig) {
        const files = glob.sync('**/*', {
            cwd: config.source,
            absolute: true,
            nodir: true,
            ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
        })
        await this.transformFiles(files, config)
    }

    private async transformFiles(files: string[], config: TranspilerConfig) {
        this.logger.info(`Compiling ${kleur.blue(files.length.toString())} files in ${kleur.blue(path.relative(config.root, config.source))} with ${kleur.blue('babel')}`)
        await Promise.all(files.map(async filepath => this.babel.transformFile(config, filepath)))
        this.logger.success(`Wrote files to ${kleur.blue(path.relative(config.root, config.output))}`)
    }
}

export interface TranspilerConfig {
    root: string
    source: string
    output: string
    modules: 'commonjs' | 'module'
    field: 'main' | 'module'
}
