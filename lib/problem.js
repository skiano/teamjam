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
    /problem\.js/,
    /node_modules\/worker-farm/,
  ]),
});

const testVm = new NodeVM({
  require: {
    external: true,
    builtin: ['*'],
  },
})

// TODO: allow user to override NodeVM options
// so they could create tests that allow access to node modules

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
  sandbox.on(`console.${method}`, function () { consoleOutput.push([method, Array.from(arguments)]) })
})

const getConsoleOutput = () => {
  const output = consoleOutput
  consoleOutput = []
  return output
}

module.exports = async function runProblem(test, solution, callback) {
  const id = path.basename(test.file)
  const result = {
    id: id,
    file: test.file,
    code: test.code,
  }

  try {
    const t = testVm.run(test.code, test.file)
    const s = sandbox.run(solution.code, solution.file)

    // validate test code
    assert.strictEqual(typeof t.test, 'function', `${id} must export test`)
    assert.strictEqual(typeof t.title, 'string', `${id} must export title`)
    assert.strictEqual(typeof t.points, 'number', `${id} must export points`)
    assert.strictEqual(typeof t.solution, 'function', `${id} must export solution`)
    assert.strictEqual(typeof t.description, 'string', `${id} must export description`)

    // validate solution code
    assert.strictEqual(typeof s.solution, 'function', `${path.basename(solution.file)} must export solution`)

    // run the solution against the test code
    await t.test(s.solution)

    result.status = 'passed'
    result.title = t.title
    result.points = t.points
    result.description = t.description
  } catch (e) {
    e.stack = stack.clean(e.stack)

    result.status = 'failed'
    result.error = format(e, {
      colorFns: {
        diffAdded: chalk.green,
        diffRemoved: chalk.red,
        errorMessage: chalk.yellow,
        errorStack: chalk.gray,
      }
    })
  }

  // grab the console output and reset it
  // TODO:
  //   prove that the console outputs do not get mixed
  //   or create a sandbox for each problem with its own redirect
  //   or segment them manually
  result.consoleOutput = consoleOutput
  consoleOutput = []

  callback(null, result)
}
