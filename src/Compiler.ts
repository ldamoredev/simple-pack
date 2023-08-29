import path from 'path'
import { glob } from 'glob'
import kleur from 'kleur'
import fs from 'fs-extra'
import * as babel from '@babel/core'

export type Log = (message: string) => void

export interface Logger {
    info: Log
    warn: Log
    success: Log
    error: Log
}

export class Compiler {
    constructor(private logger: Logger) {
    }

    async compile(config: CompilerConfig) {
        const files = glob.sync('**/*', {
            cwd: config.source,
            absolute: true,
            nodir: true,
            ignore: '**/{__tests__,__fixtures__,__mocks__}/**',
        })

        this.logger.info(
            `Compiling ${kleur.blue(files.length.toString())}
            files in ${kleur.blue(path.relative(config.root, config.source))} with ${kleur.blue('babel')}`
        )

        const pkg = JSON.parse(await fs.readFile(path.join(config.root, 'package.json'), 'utf-8'))

        await Promise.all(
            files.map(async (filepath) => {
                const outputFilename = path
                    .join(config.output, path.relative(config.source, filepath))
                    .replace(/\.(jsx?|tsx?)$/, '.js')

                await fs.mkdirp(path.dirname(outputFilename))

                if (!/\.(jsx?|tsx?)$/.test(filepath)) {
                    // Copy files which aren't source code
                    fs.copy(filepath, outputFilename)
                    return
                }

                const content = await fs.readFile(filepath, 'utf-8')
                const result = await babel.transformAsync(content, {
                    cwd: config.root,
                    babelrc: config.babelrc,
                    configFile: config.configFile,
                    sourceMaps: config.sourceMaps,
                    sourceRoot: path.relative(path.dirname(outputFilename), config.source),
                    sourceFileName: path.relative(config.source, filepath),
                    filename: filepath,
                    ...(config.babelrc || config.configFile
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
                                        modules: config.modules,
                                    },
                                ],
                                require.resolve('@babel/preset-react'),
                                require.resolve('@babel/preset-typescript'),
                            ],
                        }),
                })

                if (result == null) {
                    throw new Error('Output code was null')
                }

                let code = result.code

                if (config.sourceMaps && result.map) {
                    const mapFilename = outputFilename + '.map'

                    code += '\n//# sourceMappingURL=' + path.basename(mapFilename)

                    // Don't inline the source code, it can be retrieved from the source file
                    result.map.sourcesContent = undefined

                    fs.writeFileSync(mapFilename, JSON.stringify(result.map))
                }

                await fs.writeFile(outputFilename, code)
            })
        )

        this.logger.success(`Wrote files to ${kleur.blue(path.relative(config.root, config.output))}`)

        if (config.field in pkg) {
            try {
                require.resolve(path.join(config.root, pkg[config.field]))
            } catch (e: unknown) {
                if (
                    e != null &&
                    typeof e === 'object' &&
                    'code' in e &&
                    e.code === 'MODULE_NOT_FOUND'
                ) {
                    this.logger.error(
                        `The ${kleur.blue(config.field)} field in ${kleur.blue(
                            'package.json'
                        )} points to a non-existent file: ${kleur.blue(
                            pkg[config.field]
                        )}.\nVerify the path points to the correct file under ${kleur.blue(
                            path.relative(config.root, config.output)
                        )}.`
                    )

                    throw new Error(`Found incorrect path in '${config.field}' field.`)
                }

                throw e
            }
        } else {
            this.logger.warn(
                `No ${kleur.blue(config.field)} field found in ${kleur.blue(
                    'package.json'
                )}. Add it to your ${kleur.blue(
                    'package.json'
                )} so that consumers of your package can use it.`
            )
        }
    }
}

export interface CompilerConfig {
    root: string
    source: string
    output: string
    babelrc?: boolean | null
    configFile?: string | false | null
    sourceMaps?: boolean
    modules: 'commonjs' | false
    field: 'main' | 'module'
}

