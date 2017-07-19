
/**
 * Returns the data from a source
 */

module.exports = function stream (source: any) {
  return new Promise((resolve, reject) => {
    let data: string = ''

    source.on('data', ch => {
      data += ch
    })
    source.on('end', () => {
      try {
        resolve(JSON.parse(data))
      } catch (err) {
        reject(err)
      }
    })
    source.on('error', reject)
  })
}
