import path from 'path'
import * as logger from './logger'
import { CommonJS } from './CommonJS'

const root = process.cwd()
const report = {
    info: logger.info,
    warn: logger.warn,
    error: logger.error,
    success: logger.success,
}
const source = "src/test"
const output = "dist"
const commonJS = new CommonJS()
commonJS.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'commonjs'),
    report,
})
