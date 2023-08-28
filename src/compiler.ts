import path from 'path'
import { glob } from 'glob'
import kleur from 'kleur'
import fs from 'fs-extra'
import * as babel from '@babel/core'

export type Report = {
    info: Log
    warn: Log
    success: Log
    error: Log
}
export type Log = (message: string) => void

export type Input = {
    root: string
    source: string
    output: string
    report: Report
}

type Options = Input & {
    babelrc?: boolean | null
    configFile?: string | false | null
    sourceMaps?: boolean
    modules: 'commonjs' | false
    field: 'main' | 'module'
}

export async function compile({
      root,
      source,
      output,
      babelrc = false,
      configFile = false,
      modules,
      sourceMaps = true,
      report,
      field,
}: Options) {
    const files = glob.sync('**/*', {
        cwd: source,
        absolute: true,
        nodir: true,
        ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
    })

    report.info(
        `Compiling ${kleur.blue(String(files.length))} files in ${kleur.blue(
            path.relative(root, source)
        )} with ${kleur.blue('babel')}`
    )

    const pkg = JSON.parse(
        await fs.readFile(path.join(root, 'package.json'), 'utf-8')
    )

    await Promise.all(
        files.map(async (filepath) => {
            const outputFilename = path
                .join(output, path.relative(source, filepath))
                .replace(/\.(jsx?|tsx?)$/, '.js')

            await fs.mkdirp(path.dirname(outputFilename))

            if (!/\.(jsx?|tsx?)$/.test(filepath)) {
                // Copy files which aren't source code
                fs.copy(filepath, outputFilename)
                return
            }

            const content = await fs.readFile(filepath, 'utf-8')
            const result = await babel.transformAsync(content, {
                cwd: root,
                babelrc: babelrc,
                configFile: configFile,
                sourceMaps,
                sourceRoot: path.relative(path.dirname(outputFilename), source),
                sourceFileName: path.relative(source, filepath),
                filename: filepath,
                ...(babelrc || configFile
                    ? null
                    : {
                        presets: [
                            [
                                require.resolve('@babel/preset-env'),
                                {
                                    targets: {
                                        browsers: [
                                            '>1%',
                                            'last 2 chrome versions',
                                            'last 2 edge versions',
                                            'last 2 firefox versions',
                                            'last 2 safari versions',
                                            'not dead',
                                            'not ie <= 11',
                                            'not op_mini all',
                                            'not android <= 4.4',
                                            'not samsung <= 4',
                                        ],
                                        node: '16',
                                    },
                                    useBuiltIns: false,
                                    modules,
                                },
                            ],
                            // require.resolve('@babel/preset-react'),
                            // require.resolve('@babel/preset-typescript'),
                            // require.resolve('@babel/preset-flow'),
                        ],
                    }),
            })

            if (result == null) {
                throw new Error('Output code was null')
            }

            let code = result.code

            if (sourceMaps && result.map) {
                const mapFilename = outputFilename + '.map'

                code += '\n//# sourceMappingURL=' + path.basename(mapFilename)

                // Don't inline the source code, it can be retrieved from the source file
                result.map.sourcesContent = undefined

                fs.writeFileSync(mapFilename, JSON.stringify(result.map))
            }

            await fs.writeFile(outputFilename, code)
        })
    )

    report.success(`Wrote files to ${kleur.blue(path.relative(root, output))}`)

    if (field in pkg) {
        try {
            require.resolve(path.join(root, pkg[field]))
        } catch (e: unknown) {
            if (
                e != null &&
                typeof e === 'object' &&
                'code' in e &&
                e.code === 'MODULE_NOT_FOUND'
            ) {
                report.error(
                    `The ${kleur.blue(field)} field in ${kleur.blue(
                        'package.json'
                    )} points to a non-existent file: ${kleur.blue(
                        pkg[field]
                    )}.\nVerify the path points to the correct file under ${kleur.blue(
                        path.relative(root, output)
                    )}.`
                )

                throw new Error(`Found incorrect path in '${field}' field.`)
            }

            throw e
        }
    } else {
        report.warn(
            `No ${kleur.blue(field)} field found in ${kleur.blue(
                'package.json'
            )}. Add it to your ${kleur.blue(
                'package.json'
            )} so that consumers of your package can use it.`
        )
    }
}
