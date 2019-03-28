# teamjam

Run a code challenge for a group of people with live results and no hassle.

## Goals

* Create challenge problems with plain JS files.
* Allow people to organize themselves into teams.
* Allow teams to use one computer or many.
* People can user their own text editor.
* Display the progress of the teams live in a browser.
* Cost nothing

## Usage

### 1. Create problems to solve

Create a directory of “problem” files that export the following **required** properties:

- `title` - The display name of the problem
- `points` - How many points competitors get for solving the problem
- `description` - A helpful description of the problem to solve
- `test` - A function that takes a solution and throws if the solution failes (can be an async function)
- `solution` - A function that passes the test (it must pass for the app to build)

Here is an example of a valid problem file:

```javascript
// my-problems/my-problem.js

exports.title = 'DOUBLE A NUMBER';
exports.points = 200;
exports.description = 'when passed a number, return its double';

exports.solution = (number) => number * 2;

exports.test = (solve) => {
  const assert = require('assert')
  assert.strictEqual(solve(2), 4, 'double 2 should be 4')
};
```

_[Checkout more examples here »](https://github.com/skiano/teamjam/tree/master/example)_

### 1. Host the 

Then, you can host a public challenge like so:

```bash
$ npx teamjam serve --problems my-problems # your files live in my-problems/
```

Once, your app is running you can visit it's local public url to view the state of the challenge.

