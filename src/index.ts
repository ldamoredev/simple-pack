import path from 'path'
import { KleurLogger } from './Logger'
import { CommonJS } from './CommonJS'
import { BabelTranspiler } from './transpiler/babelTranspiler/BabelTranspiler'
import { Babel } from './transpiler/babelTranspiler/Babel'

const root = process.cwd()
const source = "src/test"
const output = "dist"

const logger = new KleurLogger()
const transpiler = new BabelTranspiler(logger, new Babel())
const commonJS = new CommonJS(transpiler, logger)

commonJS.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'commonjs')
})
