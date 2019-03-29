exports.title = 'Reverse String';
exports.points = 100;
exports.description = `
  Given a string such as "stressed", return "desserts"
`;

exports.solution = (str) => str.split('').reverse().join('');

exports.test = (fn) => {
  const assert = require('assert');
  assert.strictEqual(fn('stressed'), 'desserts', 'should reverse string');
  assert.strictEqual(fn('abc'), 'cba', 'should reverse string');
};
