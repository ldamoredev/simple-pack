import { compile, Input } from './compiler'
import path from 'path'
import kleur from 'kleur'
import del from 'del'

type Options = Input & {
    options?: {
        babelrc?: boolean | null
        configFile?: string | false | null
        sourceMaps?: boolean
        copyFlow?: boolean
    }
}

export class CommonJS {
    async build({
        root,
        source,
        output,
        options,
        report,
    }: Options) {
        report.info(`Cleaning up previous build at ${kleur.blue(path.relative(root, output))}`)
        await del([output])
        await compile({
            ...options,
            root,
            source,
            output,
            modules: 'commonjs',
            report,
            field: 'main',
        })
    }
}
