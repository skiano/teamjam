const path = require('path')
const chalk = require('chalk')
const chokidar = require('chokidar')
const { checkProblemFile } = require('../lib/problemFarm')

module.exports = async function dev({ problems }) {
  const dir = path.resolve(process.cwd(), problems)

  console.log(`> developing tests from: ${chalk.cyan(dir)}`)

  const watcher = chokidar.watch(path.resolve(dir, '*.js'))

  const checkFile = async (f) => {
    const result = await checkProblemFile(f)

    if (result.status === 'passed') {
      console.log(chalk.green(`✓ ${result.id}`))
    } else {
      console.log(chalk.red(`✘ ${result.id}`))
      console.log('')
      console.log(result.error)
    }
  }

  watcher.on('add', checkFile)
  watcher.on('change', checkFile)
}
