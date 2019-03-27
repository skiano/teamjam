#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['help'],
  alias: {
    'help': 'h',
    'url': 'u',
    'team': 't',
    'problems': 'p',
  }
})

const help = () => {
  console.log([
    ``,
    `EXAMPLE USAGE:`,
    ``,
    `$ teamjam --help`,
    `$ teamjam play --url="http://..." --team="MY TEAM"`,
    `$ teamjam serve --problems=directory/with/problems`,
    '',
  ].join('\n'))
}

const main = async () => {
  const [command] = argv._

  switch (true) {
    case !!argv.help: return help()
    case command === 'serve': return require('../server')(argv)
    case command === 'play': return require('../client')(argv)
    default: throw new Error('Invalid command')
  }
}

main().catch(e => {
  console.log(`\n${e.stack}`)
  help()
  process.exit(1)
})
