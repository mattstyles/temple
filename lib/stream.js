
/**
 * Returns the data from a source
 */

module.exports = function (source) {
  return new Promise((resolve, reject) => {
    let data = ''

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
    source.on('error', err => reject(err))
  })
}
