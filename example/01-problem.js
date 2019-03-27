exports.points = 100;
exports.title = 'PROBLEM 2'
exports.description = `
  Description...
`

exports.solution = () => {
  return 2;
};

exports.test = (f) => {
  const assert = require('assert')
  assert.strictEqual(f(), 2, 'should return 2')
}
