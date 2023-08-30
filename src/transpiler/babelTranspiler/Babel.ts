import fs from 'fs-extra'
import { TranspilerConfig } from './BabelTranspiler'
import { BabelFileResult } from '@babel/core'
import path from 'path'
import * as babel from '@babel/core'
import { defaultBabelrcConfig } from './DefaultBabelrcConfig'

export class Babel {
    async transformFile(config: TranspilerConfig, filepath: string) {
        const outputFileName = await this.outputFileNameOf(config, filepath)
        if (this.isJsxTsxFile(filepath)) return await fs.copy(filepath, outputFileName)
        const result = await this.transform(filepath, config, outputFileName)
        await this.createOutputFile(result, config, outputFileName)
    }

    private async outputFileNameOf(config: TranspilerConfig, filepath: string) {
        const outputFilename = path
            .join(config.output, path.relative(config.source, filepath))
            .replace(/\.(jsx?|tsx?)$/, '.js')

        await fs.mkdirp(path.dirname(outputFilename))
        return outputFilename
    }

    private async transform(filepath: string, config: TranspilerConfig, outputFile: string) {
        const content = await fs.readFile(filepath, 'utf-8')
        const result = await babel.transformAsync(content, {
            cwd: config.root,
            babelrc: config.babelrc,
            configFile: config.configFile,
            sourceMaps: config.sourceMaps,
            sourceRoot: path.relative(path.dirname(outputFile), config.source),
            sourceFileName: path.relative(config.source, filepath),
            filename: filepath,
            ...(config.babelrc || config.configFile ? null : defaultBabelrcConfig(config.modules)),
        })

        if (result == null) throw new Error('Output code was null')
        return result
    }

    private isJsxTsxFile(filepath: string) {
        return !/\.(jsx?|tsx?)$/.test(filepath)
    }

    private async createOutputFile(result: BabelFileResult, config: TranspilerConfig, outputFileName: string) {
        let code = result.code
        if (config.sourceMaps && result.map) {
            const mapFilename = outputFileName + '.map'
            code += '\n//# sourceMappingURL=' + path.basename(mapFilename)
            result.map.sourcesContent = undefined
            fs.writeFileSync(mapFilename, JSON.stringify(result.map))
        }
        await fs.writeFile(outputFileName, code)
    }
}
