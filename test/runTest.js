const path = require('path')
const chalk = require('chalk')
const assert = require('assert')
const StackUtils = require('stack-utils')
const { NodeVM } = require('vm2')
const { format } = require('assertion-error-formatter')

const stack = new StackUtils({
  cwd: '/',
  internals: StackUtils.nodeInternals().concat([
    /node_modules\/vm2/,
    /runTest\.js/,
    /node_modules\/worker-farm/,
  ]),
});


const vm = new NodeVM({
  console: 'inherit',
  sandbox: {},
  require: {
    external: true,
    builtin: [
      'fs',
      'path',
      'assert'
    ],
    root: "./",
    mock: {
      fs: {
        readFileSync() { return 'Nice try!'; }
      }
    }
  }
});

module.exports = async function runTest(test, callback) {
  try {
    let t = vm.run(test.code, test.file)
    const id = path.basename(test.file)

    assert.strictEqual(typeof t.points, 'number', `${id} must export points`)
    assert.strictEqual(typeof t.test, 'function', `${id} must export points`)
    assert.strictEqual(typeof t.solution, 'function', `${id} must export points`)

    await t.test(t.solution)
    callback(null, {
      id: id,
      file: test.file,
      code: test.code,
      points: t.points,
      status: 'passed',
    })
  } catch (e) {
    e.stack = stack.clean(e.stack)

    callback(null, {
      file: test.file,
      status: 'failed',
      error: format(e, {
        colorFns: {
          diffAdded: chalk.green,
          diffRemoved: chalk.red,
          errorMessage: chalk.yellow,
          errorStack: chalk.gray,
        }
      }),
    })
  }
}
