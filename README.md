# teamjam

run a code challenge for a group with live results and no hassle

## Goals

* Create tests with plain JS files
* Allow multiple people to self organize into teams to compete
* Serve an app that coordinates the competition and shows what is going on
* It should cost nothing

## Usage

To host a challenge you create a directory of "problem" files that look like this:

```javascript
// my-problems/my-problem.js

exports.title = 'DOUBLE A NUMBER';
exports.points = 200;
exports.description = 'when passed a number, return its double';

exports.solution = (number) => number * 2;

exports.test = (f) => {
  const assert = require('assert')
  assert.strictEqual(f(2), 4, 'should double 2')
}
```

_To see a full example, check out [the example](https://github.com/skiano/teamjam/tree/master/example)_

Then, you can host a public challenge like so:

```bash
$ npx teamjam serve --problems my-problems # your files live in my-problems/
```

Once, your app is running you can visit it's local public url to view the state of the challenge.

