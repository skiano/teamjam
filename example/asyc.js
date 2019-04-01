exports.title = 'abc'
exports.points = 200
exports.description = `
  Given a promise of a number return a promise of its double.
`

exports.solution = (p) => {
  return p.then(n => n * 2)
}

exports.test = async (fn) => {
  const assert = require('assert')
  const p = Promise.resolve(2)
  const v = await fn(p)
  assert.strictEqual(v, 4, 'should double the promise')
}
