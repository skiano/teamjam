const fs = require('fs')
const path = require('path')
const util = require('util')
const workerFarm = require('worker-farm')

const workers = workerFarm({
  maxRetries: 0,
  maxCallTime: 5000,
  maxConcurrentCallsPerWorker: 1,
}, require.resolve('./problem'))

const runProblem = util.promisify(workers)
const readFile = util.promisify(fs.readFile)

exports.runProblem = async function(test, solution) {
  // test looks like { code, file }
  try {
    const result = await runProblem(test, solution)
    return result
  } catch (e) {
    if (e.type === 'TimeoutError') {
      e = new Error('failed to execute test in under 5 seconds')
    }

    return {
      id: path.basename(test.file),
      status: 'failed',
      error: e.stack,
      consoleOutput: [],
    }
  }
}

exports.checkProblemFile = async function(file) {
  const code = await readFile(file)
  const test = { code: code.toString(), file }
  return exports.runProblem(test, test)
}

exports.shutdown = function() {
  workerFarm.end(workers)
}
