const fs = require('fs')
const util = require('util')
const path = require('path')
const uuid = require('uuid/v4')
const chalk = require('chalk')
const ngrok = require('ngrok')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmitter = require('events')
const getTests = require('../lib/getProblemSet')
const { runProblem } = require('../lib/problemFarm')

function createApp(problemSet) {
  const app = express()

  /*********************/
  /* CREATE STATE MGMT */
  /*********************/

  const EE = new EventEmitter()
  const EVENTS = []
  EE.on('event', (e) => EVENTS.push(e))

  /*****************************************/
  /* SEND COMPLETE EVENT RECORD TO CLIENTS */
  /*****************************************/

  app.get('/events', (req, res) => {
    res.json(EVENTS)
  })

  /***************************/
  /* SEND UPDATES TO CLIENTS */
  /***************************/

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
    try {
      const problem = problemSet.problems.find(p => p.id === req.body.id)

      if (!problem) throw new Error(`could not find problem: '${req.body.id}'`)

      const result = await runProblem({ file: problem.id, code: problem.code }, req.body.test)

      if (result.status === 'passed') {
        EE.emit('event', {
          id: uuid(),
          time: Date.now(),
          problem: problem.id,
          points: problem.points,
          team: req.body.team,
          solution: req.body.test.code.replace(/(\/\*)[\s\S]*(\*\/)\s*/m, ''),
        })
        console.log(`> ${chalk.green('passed')} [${req.body.id}] ${req.body.team}`)
      } else {
        console.log(`> ${chalk.red('failed')} [${req.body.id}] ${req.body.team}`)
      }

      res.json(result)
    } catch (err) {
      next(err)
    }
  })

  /********************************/
  /* EXPOSE PROBLEMS FOR DOWNLOAD */
  /********************************/

  app.get('/problems', (req, res) => {
    res.json(problemSet)
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

  const url = await ngrok.connect(PORT);

  console.log(`> public at: ${url}`)
}
