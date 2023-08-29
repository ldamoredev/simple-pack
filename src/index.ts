import path from 'path'
import * as logger from './logger'
import { CommonJS } from './CommonJS'
import { Compiler } from './Compiler'

const root = process.cwd()
const reporter = {
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
    success: logger.success,
}

const source = "src/test"
const output = "dist"
const compiler = new Compiler(reporter)
const commonJS = new CommonJS(compiler, reporter)

commonJS.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'commonjs')
})
