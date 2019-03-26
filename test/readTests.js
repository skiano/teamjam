const fs = require('fs')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const readdir = util.promisify(fs.readdir)
const { runTestFromFile, shutdown } = require('./index')

module.exports = async function readTests(dir) {
  console.log(`> building tests: ${chalk.cyan(dir)}`)

  const testMap = {}
  const files = await readdir(dir)
  const tests = files.filter(f => path.extname(f) === '.js').map(f => path.resolve(dir, f))
  const results = await Promise.all(tests.map(runTestFromFile))

  shutdown()

  let hasFailure

  results.forEach(async (r) => {
    if (r.status === 'passed') {
      console.log(chalk.green(`✓ ${path.basename(r.file)}`))
      testMap[r.id] = r
    } else {
      hasFailure = true
      console.log(chalk.red(`✘ ${path.basename(r.file)}`))
      console.log('\n')
      console.log(r.error)
    }
  })

  if (hasFailure) {
    console.error(chalk.red('\nAll tests must pass when creating config!'))
    process.exit(1)
  }

  return testMap
}

const main = async () => {
  const path = require('path')
  const example = path.resolve(__dirname, '..', 'example')
  const tests = await module.exports(example)
  console.log(tests)
}

main()
