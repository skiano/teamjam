const chalk = require('chalk')
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
    await t.test(t.solution)
    callback(null, {
      points: t.points,
      status: 'passed',
    })
  } catch (e) {
    e.stack = stack.clean(e.stack)

    callback(null, {
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
