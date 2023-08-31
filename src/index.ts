import path from 'path'
import { KleurLogger } from './Logger'
import { CommonJS } from './targets/CommonJS'
import { BabelTranspiler } from './transpiler/babelTranspiler/BabelTranspiler'
import { Babel } from './transpiler/babelTranspiler/Babel'
import { Module } from './targets/Module'

const root = process.cwd()
const source = "src/test"
const output = "dist"

const logger = new KleurLogger()
const transpiler = new BabelTranspiler(new Babel(), logger)

const commonJS = new CommonJS(transpiler, logger)
const module = new Module(transpiler, logger)

commonJS.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'commonjs')
})
module.build({
    root,
    source: path.resolve(root, source as string),
    output: path.resolve(root, output as string, 'module')
})
