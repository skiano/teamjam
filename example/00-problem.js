exports.title = 'RETURN 2'
exports.points = 100;
exports.description = `
Return 2 please
`

exports.solution = () => {
  return 2;
};

exports.test = (f) => {
  const assert = require('assert')
  assert.strictEqual(f(), 2, 'should return 2')
}
