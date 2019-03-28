exports.title = 'Double a Number';
exports.points = 100;
exports.description = `
  Given a number, return twice its value.
`;

exports.solution = (n) => n * 2;

exports.test = (fn) => {
  const assert = require('assert');
  assert.strictEqual(fn(2), 4, '2 doubled should be 4');
};
