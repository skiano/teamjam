const fs = require('fs')
const util = require('util')
const path = require('path')
const fetch = require('node-fetch')
const readFile = util.promisify(fs.readFile)
const writeFile = util.promisify(fs.writeFile)

const setup = async (dir) => {
  const res = await fetch('http://localhost:4040/problems')
  const { problems } = await res.json()

  await Promise.all(problems.map(async (p) => {
    await writeFile(path.resolve(dir, p.id), p.code)
  }))
}

const submitTest = async (test) => {
  const res = await fetch('http://localhost:4040/submit', {
    method: 'POST',
    body: JSON.stringify({
      id: path.basename(test.file),
      team: 'TEAM NAME',
      test: test,
    }),
    headers: { 'Content-Type': 'application/json' },
  })

  if (res.status > 400) {
    throw new Error(`Failed to submit:\n${JSON.stringify(test, null, 2)}`)
  }

  return res.json()
}

const submitTestFromFile = async (file) => {
  const code = await readFile(file)
  return submitTest({
    file: file,
    code: code.toString(),
  })
}

const main = async () => {
  const dir = path.resolve(__dirname, 'example')
  // await setup(dir)
  const result = await submitTestFromFile(path.resolve(dir, '00-problem.js'))
  console.log('result', result)
}

main()
