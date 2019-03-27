const fs = require('fs')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const readdir = util.promisify(fs.readdir)
// const writeFile = util.promisify(fs.writeFile)
const { runTestFromFile } = require('./index')

module.exports = async function writeTests(dir) {
  // const output = path.resolve(dir, '__data__.json')

  console.log(`> building tests data from: ${chalk.cyan(dir)}`)

  const data = {
    problems: [],
  }

  const files = await readdir(dir)
  const tests = files.filter(f => path.extname(f) === '.js').map(f => path.resolve(dir, f))
  const results = await Promise.all(tests.map(runTestFromFile))

  let hasFailure

  results.forEach(async (r) => {
    if (r.status === 'passed') {
      console.log(chalk.green(`✓ ${path.basename(r.file)}`))
      data.problems.push({
        id: r.id,
        code: r.code,
        points: r.points,
      })
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

  // await writeFile(output, JSON.stringify(data, null, 2))
  return data
}
