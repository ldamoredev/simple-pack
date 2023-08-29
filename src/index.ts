import path from 'path'
import { KleurLogger } from './Logger'
import { CommonJS } from './CommonJS'
import { Compiler } from './Compiler'

const root = process.cwd()
const source = "src/test"
const output = "dist"

const logger = new KleurLogger()
const compiler = new Compiler(logger)
const commonJS = new CommonJS(compiler, logger)

commonJS.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'commonjs')
})
