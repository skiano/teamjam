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

// TODO:
// run the tester code in a permissive sandbox
// and run the player code in a tighter one
// (also allow user to override the sandbox options)

const testVm = new NodeVM({
  require: {
    external: true,
    builtin: ['*'],
  },
})

const sandbox = new NodeVM({
  console: 'redirect',
  sandbox: {},
  require: {
    external: false,
    builtin: [],
    mock: {}
  }
})

let consoleOutput = []
let methods = ['log', 'info', 'warn', 'error', 'dir', 'trace']

methods.forEach((method) => {
  sandbox.on(`console.${method}`, (msg) => { consoleOutput.push([method, msg]) })
})

const getConsoleOutput = () => {
  const output = consoleOutput
  consoleOutput = []
  return output
}

module.exports = async function runTest(test, solution, callback) {
  const id = path.basename(test.file)

  try {
    const t = testVm.run(test.code, test.file)
    const s = solution && sandbox.run(solution.code, solution.file)

    assert.strictEqual(typeof t.points, 'number', `${id} must export points`)
    assert.strictEqual(typeof t.test, 'function', `${id} must export test`)
    assert.strictEqual(typeof t.solution, 'function', `${id} must export solution`)
    assert.strictEqual(typeof t.description, 'string', `${id} must export description`)
    assert.strictEqual(typeof t.title, 'string', `${id} must export title`)

    if (solution) {
      assert.strictEqual(typeof s.solution, 'function', `${path.basename(solution.file)} must export solution`)
    }

    await t.test(solution ? s.solution : t.solution)

    callback(null, {
      id: id,
      file: test.file,
      code: test.code,
      title: t.title,
      description: t.description,
      points: t.points,
      status: 'passed',
      consoleOutput: getConsoleOutput(),
    })
  } catch (e) {
    e.stack = stack.clean(e.stack)

    callback(null, {
      id: id,
      status: 'failed',
      consoleOutput: getConsoleOutput(),
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
