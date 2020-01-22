const treeshaking = require('stupid-treeshaking-js')
const babylon = require('babylon')
const traverse = require('babel-traverse').default

const fs = require('fs')
const path = require('path')
let subStr = /import.*?.pen'/

const f = function(src) {
    let pp = path.basename(this.resourcePath)
    if (pp.split('.')[1] === 'pen') {
        if (!this._module.issuer) {
            // 没有 issuer 说明是 入口文件，由系统调用而非模块间调用
            src = src.replace(subStr, function(txt) {
                let ast = babylon.parse(txt, { sourceType: 'module' })
                let expo = []
                traverse(ast, {
                    ImportSpecifier: (path) => {
                        expo.push(path.node.imported.name)
                    },
                    ImportDefaultSpecifier: (path) => {
                        expo.push(path.node.local.name)
                    }
                })
                //在路径尾部说明应该导出哪些变量
                return txt.slice(0, -1) + '.ts?' + expo.sort().join() + "'"
            })
            return src
        } else {
            return treeshaking(
                path
                    .basename(this.resource)
                    .split('?')
                    .pop()
                    .split(','),
                src
            )
        }
    }
    return src
}

module.exports = f
