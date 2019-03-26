const path = require('path')
const express = require('express')
const bodyParser = require('body-parser')
const EventEmitter = require('eventemitter3')

const app = express()

/**********************************/
/* CREATE EVENT EMITTER FOR STATE */
/**********************************/

const EE = new EventEmitter()

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

app.get('/submit', bodyParser.json(), (req, res) => {
  EE.emit('solve', {
    time: Date.now(),
    team: 'Team Name',
    problem: 3,
    solution: 'function() {}',
  })

  res.json({
    status: 'ok',
  })
})

/********************************/
/* EXPOSE PROBLEMS FOR DOWNLOAD */
/********************************/

app.get('/problems', (req, res) => {
  res.json({
    problems: [
      {
        name: 'test-one.js',
        stub: 'function () {}',
        test: 'sdfsdfsdf () {}',
        hint: 'function () {}',
      }
    ]
  })
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
