import fs from 'fs-extra'
import { TranspilerConfig } from './BabelTranspiler'
import * as babel from '@babel/core'
import path from 'path'
import { defaultBabelPresets } from './DefaultBabelPresets'

export class Babel {
    async transformFile(config: TranspilerConfig, filepath: string) {
        const outputFileName = await this.outputFileNameOf(config, filepath)
        if (this.isJsxTsxFile(filepath)) return await fs.copy(filepath, outputFileName)
        const result = await this.transform(filepath, config, outputFileName)
        await fs.writeFile(outputFileName, result.code)
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
        const modules = config.modules == 'commonjs' ? 'commonjs' : false
        const result = await babel.transformAsync(content, {
            cwd: config.root,
            sourceRoot: path.relative(path.dirname(outputFile), config.source),
            sourceFileName: path.relative(config.source, filepath),
            filename: filepath,
            ...(defaultBabelPresets(modules)),
        })
        if (result == null) throw new Error('Output code was null')
        return result
    }

    private isJsxTsxFile(filepath: string) {
        return !/\.(jsx?|tsx?)$/.test(filepath)
    }
}
