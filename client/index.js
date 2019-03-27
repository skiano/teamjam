const fs = require('fs')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const fetch = require('node-fetch')
const chokidar = require('chokidar')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const removeExports = (code, exportKey) => {
  // example REGEX /(exports\.test[\s\S]*?)(exports|$)/
  const regex = new RegExp(`(exports\\.${exportKey}[\\s\\S]*?)(exports|$)`, '');
  const matches = code.match(regex)

  return matches
    ? code.replace(matches[1], '')
    : code
}

module.exports = async function createClient(options) {
  if (!options.url) {
    throw new Error('--url is required')
  }

  if (!options.team) {
    throw new Error('--team is required')
  }

  const TESTS = {}

  options.root = options.root
    ? path.resolve(process.cwd(), options.root)
    : process.cwd()

  /********************/
  /* SETUP TEST FILES */
  /********************/

  const res = await fetch(`${options.url}/problems`)
  const { problems } = await res.json()

  await Promise.all(problems.map(async (p) => {
    const file = path.resolve(options.root, p.id)
    let code = removeExports(p.code, 'test')
    code = removeExports(code, 'points')

    await writeFile(file, code) // TODO: only if file exists

    TESTS[file] = {
      id: p.id,
      code: code,
    }
  }))

  /*********************/
  /* WATCH FOR CHANGES */
  /*********************/

  const watchFiles = Object.keys(TESTS)
  const watcher = chokidar.watch(watchFiles)

  console.log(`> watching problems in: ${chalk.yellow(path.relative(process.cwd(), options.root))}`)

  watcher.on('change', async (f) => {
    const buff = await readFile(f)
    const code = buff.toString()

    if (TESTS[f].code.trim() === code.trim()) return // no change
    TESTS[f].code = code

    console.log(`> submitting test: ${chalk.cyan(path.basename(f))}`)

    const res = await fetch(`${options.url}/submit`, {
      method: 'POST',
      body: JSON.stringify({
        id: path.basename(f),
        team: options.team,
        test: {
          code: code,
          file: f,
        },
      }),
      headers: { 'Content-Type': 'application/json' },
    })

    if (res.status > 400) {
      return console.error(chalk.red(`Failed to submit:\n${JSON.stringify(test, null, 2)}`))
    }

    TESTS[f].result = await res.json()

    if (TESTS[f].result.status === 'failed') {
      console.log()
      console.log(chalk.red(`FAILURE: ${TESTS[f].id}\n`))
      console.log(TESTS[f].result.error)
    }

    console.log(`\n> STATUS`)

    let points = 0

    Object.values(TESTS).forEach(t => {
      if (t.result) {
        if (t.result.status === 'passed') {
          points += t.result.points
          console.log(`  - ${t.id} ${chalk.green('passing')}`)
        } else {
          console.log(`  - ${t.id} ${chalk.red('failing')}`)
        }
      } else {
        console.log(`  - ${t.id} ${chalk.gray('pending')}`)
      }

    })

    console.log(`  - total points ${chalk.yellow(points)}\n`)
  })
}
