/*
PROBLEM 1: Return 2
*/

exports.solution = () => {
  return 3;
};

exports.test = (f) => {
  const assert = require('assert')
  assert.strictEqual(f(), 2, 'should return 2')
}

exports.points = 100;
