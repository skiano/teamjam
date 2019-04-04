const fs = require('fs')
const util = require('util')
const path = require('path')
const chalk = require('chalk')
const ngrok = require('ngrok')
const express = require('express')
const bodyParser = require('body-parser')
const Convert = require('ansi-to-html')
const EventEmitter = require('events')
const getTests = require('../lib/getProblemSet')
const { runProblem } = require('../lib/problemFarm')

const convert = new Convert()

function createApp(PROBLEMS) {
  const app = express()

  /*********************/
  /* CREATE STATE MGMT */
  /*********************/

  const HAS_SOLVED = {}
  const EE = new EventEmitter()
  const EVENTS = []

  EE.on('event', (e) => {
    console.log(`> event: ${e.team} - ${e.type} - ${e.problemId}`)
    EVENTS.push(e)
  })

  const emitEvent = (eventType, eventData) => {
    EE.emit('event', Object.assign({ type: eventType, time: Date.now() }, eventData))
  }

  let thread = 0
  const createEventThread = () => {
    const threadId = thread++
    return (t, d) => emitEvent(t, Object.assign({ thread: threadId }, d))
  }

  /*****************************************/
  /* SEND COMPLETE EVENT RECORD TO CLIENTS */
  /*****************************************/

  app.get('/events', (req, res) => {
    res.json(EVENTS)
  })

  /********************************/
  /* EXPOSE PROBLEMS FOR DOWNLOAD */
  /********************************/

  app.get('/problems', (req, res) => {
    res.json(PROBLEMS)
  })

  /****************************/
  /* STREAM EVENTS TO CLIENTS */
  /****************************/

  const sendMessage = (res, channel, data) => {
    res.write(`event: ${channel}\nid: 0\ndata: ${data}\n`);
    res.write("\n\n");
  };

  app.get('/notification', (req, res) => {
    // Open the event stream for live reload
    res.writeHead(200, {
      'Connection': 'keep-alive',
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Access-Control-Allow-Origin': '*',
    });

    // Send an initial ack event to stop request pending
    sendMessage(res, "connected", "awaiting change");

    // Send a ping event every minute to prevent console errors
    setInterval(sendMessage, 60000, res, "ping", "still waiting");

    // subscribe for updates
    const handleSolve = (data) => sendMessage(res, 'event', JSON.stringify(data))
    EE.on('event', handleSolve)

    // Cleanup subscription when user disconnects
    res.on('close', () => {
      EE.removeListener('event', handleSolve)
    });
  })

  /********************/
  /* ACCEPT SOLUTIONS */
  /********************/

  app.post('/submit', bodyParser.json(), async (req, res, next) => {
    const {
      team,
      problemId,
      solution,
    } = req.body

    const emitThreadedEvent = createEventThread()

    try {
      emitThreadedEvent('submit', { team, problemId })

      const problem = PROBLEMS.problems.find(p => p.id === problemId)

      if (!problem) throw new Error(`Sorry, the problem ‘${problemId}’ does not exist`)

      const result = await runProblem(problem, solution)
      const { status, error, consoleOutput } = result

      if (status === 'passed') {
        const solveKey = [team, problemId].join('-')
        const code = solution.code.replace(/(\/\*)[\s\S]*(\*\/)\s*/m, '')
        const firstSolve = !HAS_SOLVED[solveKey]

        emitThreadedEvent('solve', {
          team,
          problemId,
          code,
          firstSolve,
        })

        HAS_SOLVED[solveKey] = firstSolve
      } else {
        emitThreadedEvent('fail', {
          team,
          problemId,
          error: convert.toHtml(error),
          consoleOutput,
        })
      }

      res.json(result)
    } catch (error) {
      emitThreadedEvent('error', { team, problemId, error })
      next(error)
    }
  })

  /********************/
  /* SERVE CLIENT APP */
  /********************/

  app.get('/*', express.static(path.resolve(__dirname, '..', 'ui')))

  return app
}

module.exports = async function serve(options) {
  if (!options.problems) {
    throw new Error('--problems is required')
  }

  const DIRECTORY = path.resolve(process.cwd(), options.problems)
  const PORT = process.env.PORT || 4000

  if (!fs.existsSync(DIRECTORY)) {
    throw new Error('--problems must specify an existing directory')
  }

  const problems = await getTests(DIRECTORY)
  const app = createApp(problems)

  await new Promise((resolve) => {
    app.listen(PORT, () => {
      console.log(`> local at: http://localhost:${PORT}`)
      resolve()
    })
  })

  const url = await ngrok.connect(PORT)

  console.log(`> public at: ${url}`)
}
