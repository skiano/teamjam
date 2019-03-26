const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmitter = require('eventemitter3')
const { runTest } = require('../test')

const app = express()

/*********************/
/* CREATE STATE MGMT */
/*********************/

const EE = new EventEmitter()
const EVENTS = []
EE.on('solve', (e) => EVENTS.push(e))

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
  const handleSolve = (data) => sendMessage(res, 'solve', JSON.stringify(data))
  EE.on('solve', handleSolve)

  // Cleanup subscription when user disconnects
  res.on('close', () => {
    EE.removeListener('solve', handleSolve)
  });
})

/********************/
/* ACCEPT SOLUTIONS */
/********************/

app.post('/submit', bodyParser.json(), async (req, res, next) => {
  try {
    const result = await runTest(req.body.test)

    if (result.status === 'passed') {
      EE.emit('solve', {
        time: Date.now(),
        team: req.body.team,
        problem: req.body.id,
        solution: req.body.test.code,
      })
    }

    res.json(result)
  } catch (err) {
    next(err)
  }
})

/********************************/
/* EXPOSE PROBLEMS FOR DOWNLOAD */
/********************************/

const problemSet = require('../example/__data__.json')

app.get('/problems', (req, res) => {
  res.json(problemSet)
})

/********************/
/* SERVE CLIENT APP */
/********************/

app.get('/*', express.static(path.resolve(__dirname, '..', 'public')))

/********************/
/* START THE SERVER */
/********************/

app.listen(4040, () => {
  console.log('> serving :4040')
})
