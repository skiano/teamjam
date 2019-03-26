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

module.exports = async function runTest(test, solution, callback) {
  const id = path.basename(test.file)

  try {
    const t = vm.run(test.code, test.file)
    const s = solution && vm.run(solution.code, solution.file)

    assert.strictEqual(typeof t.points, 'number', `${id} must export points`)
    assert.strictEqual(typeof t.test, 'function', `${id} must export test`)
    assert.strictEqual(typeof t.solution, 'function', `${id} must export solution`)

    if (solution) {
      assert.strictEqual(typeof s.solution, 'function', `${path.basename(solution.file)} must export solution`)
    }

    await t.test(solution ? s.solution : t.solution)

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
      id: id,
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
