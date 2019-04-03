const fs = require('fs')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const fetch = require('node-fetch')
const dedent = require('dedent')
const chokidar = require('chokidar')
const fileAccess = util.promisify(fs.access)
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)
const getSignature = require("../lib/getSignature")

module.exports = async function play(options) {
  if (!options.url) {
    throw new Error('--url is required')
  }

  if (!options.team) {
    throw new Error('--team is required')
  }

  options.root = options.root
    ? path.resolve(process.cwd(), options.root)
    : process.cwd()

  // Keep track of the state of the player’s work
  const TESTS = {}

  /********************/
  /* SETUP TEST FILES */
  /********************/

  const res = await fetch(`${options.url}/problems`)
  const { problems } = await res.json()

  await Promise.all(problems.map(async (p) => {
    // create code for player to download
    const file = path.resolve(options.root, p.id)
    const header = `${p.title.trim()} - points: ${p.points}`
    const code = dedent(`
      /*
      ${'-'.repeat(header.length)}
      ${header}
      ${'-'.repeat(header.length)}
      ${p.description.trim()}
      */

      exports.solution = ${getSignature(p.code)} => {
        // your solution here...
      }
    `)

    // do not overwrite their existing solution
    try {
      await fileAccess(file)
    } catch (_) {
      await writeFile(file, code)
    }

    // store an initial state of the problem
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

  const submitFile = async (file) => {
    const id = path.basename(file)
    const buff = await readFile(file)
    const code = buff.toString()

    if (TESTS[file].code.trim() === code.trim()) return // no change
    TESTS[file].code = code

    console.log(`> submitting test: ${chalk.cyan(id)}`)

    const res = await fetch(`${options.url}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: id,
        team: options.team,
        test: {
          code: code,
          file: file,
        },
      }),
    })

    if (res.status > 400) {
      return console.error(chalk.red(`Failed to submit: ${id}`))
    }

    TESTS[file].result = await res.json()

    if (TESTS[file].result.status === 'failed') {
      console.log()
      console.log(chalk.red(`FAILURE: ${TESTS[file].id}\n`))
      if (TESTS[file].result.consoleOutput.length > 0) {
        TESTS[file].result.consoleOutput.forEach(([method, args]) => {
          console.log.apply(this, args)
        })
        console.log('')
      }
      console.log(TESTS[file].result.error)
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
  }

  watcher.on('add', submitFile)
  watcher.on('change', submitFile)
}
