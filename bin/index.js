#! /usr/bin/env node

const argv = require('minimist')(process.argv.slice(2), {
  boolean: ['help'],
  alias: {
    'help': 'h',
    'url': 'u',
    'team': 't',
    'problems': 'p',
    'root': 'r',
  }
})

const help = () => {
  console.log([
    ``,
    `USAGE:`,
    `  teamjam --help`,
    `  teamjam play --url http://localhost:4000`,
    `  teamjam serve --problems directory/with/problems`,
    `  teamjam dev --problems directory/with/problems`,
    '',
    `FLAGS:`,
    `  -h, --help`,
    `  -p, --problems  path to directory of problems to serve/dev`,
    `  -u, --url       the url of the app you want to play with`,
    `  -t, --team      your team name while playing`,
    `  -r, --root      (optional) path you want to download the problems to play`,
    ``,
  ].join('\n'))
}

const main = async () => {
  const [command] = argv._

  switch (true) {
    case !!argv.help: return help()
    case command === 'serve': return require('./serve')(argv)
    case command === 'play': return require('./play')(argv)
    case command === 'dev': return require('./dev')(argv)
    default: throw new Error('Invalid command')
  }
}

main().catch(e => {
  console.log(`\n${e.stack}`)
  help()
  process.exit(1)
})
