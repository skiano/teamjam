const fs = require('fs')
const util = require('util')
const workerFarm = require('worker-farm')

const workers = workerFarm({
  autoStart: true,
  maxRetries: 0,
  maxCallTime: 5000,
  maxConcurrentCallsPerWorker: 1,
}, require.resolve('./runTest'))

const runTest = util.promisify(workers)
const readFile = util.promisify(fs.readFile)

const safeRun = async (test) => {
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

const runTestFromFile = async (file) => {
  const code = await readFile(file)
  return safeRun({ code: code.toString(), file })
}

const main = async () => {
  const result = await runTestFromFile(require.resolve('../example/00-problem'))

  if (result.error) {
    console.log(result.error)
  } else {
    console.log(`earned ${result.points}!`)
  }

  workerFarm.end(workers)
}

main()
