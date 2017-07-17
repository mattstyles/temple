
const path = require('path')

exports.basename = (ext: string) =>
  (str: string) => path.basename(str, ext)

exports.id = (a: any) =>
  (b: any) => a === b

exports.req = (filepath: string) => () => require(filepath)

exports.unbox = (collection: Array<any>) => collection[0]
