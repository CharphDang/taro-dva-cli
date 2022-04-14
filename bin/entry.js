#!/usr/bin/env node
// * 指定脚本解释器为node
const program = require('commander')
program.version(require('../package').version)

program.command('init <name>').description('init project').action(require('../lib/init'))

//这句话必须写在最后面   提供帮助  -h
program.parse(process.argv)
