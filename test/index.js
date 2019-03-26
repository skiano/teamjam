const fs = require('fs')
const util = require('util')
const workerFarm = require('worker-farm')

const workers = workerFarm({
  maxRetries: 0,
  maxCallTime: 5000,
  maxConcurrentCallsPerWorker: 1,
}, require.resolve('./runTest'))

const runTest = util.promisify(workers)
const readFile = util.promisify(fs.readFile)

exports.runTest = async function(test) {
  try {
    const result = await runTest(test)
    return result
  } catch (e) {
    if (e.type === 'TimeoutError') {
      e = new Error('failed to execute test in under 5 seconds')
    }
    return {
      status: 'failed',
      error: e.stack,
    }
  }
}

exports.runTestFromFile = async function(file) {
  const code = await readFile(file)
  return exports.runTest({ code: code.toString(), file })
}

exports.shutdown = function() {
  workerFarm.end(workers)
}

// const main = async () => {
//   const result = await exports.runTestFromFile(require.resolve('../example/00-problem'))
//
//   if (result.error) {
//     console.log(result.error)
//   } else {
//     console.log(`earned ${result.points}!`)
//   }
//
//   exports.shutdown()
// }
//
// main()
