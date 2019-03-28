# teamjam

Run a real-time code challenge for teams.

## Goals

* Create challenge problems with JS files.
* Allow people to organize themselves into teams.
* Give problems point values so teams can strategize about which problems to tackle.
* Allow teams to use one computer or many.
* People can user their own text editor.
* Display the progress of the teams live in a browser.
* Cost nothing.

## Usage

### 1. Create a challenge.

Create a directory of “problem” files that each export the following **required** properties:

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

To develop your tests and verify they are valid, run:

```bash
$ npx teamjam dev --problems my-problems # your files live in my-problems/
```

### 1. Run the challenge.

Once you have a directory filled with problems, you can run the challenge like so:

```bash
$ npx teamjam serve --problems my-problems # your files live in my-problems/
```

This will create an app that coordinates the challenge.

_Please note: this app will only work in browsers that support esm and async/await and other modern APIs._

### 2. Ask people to join.

Once the app is running on a URL, people can use the cli to join the fun:

```bash
$ teamjam play --url="http://...url of the app" --team="MY TEAM"
```

_The app will also show instructions for joining, so you can just share the URL_

### 3. Watch them play.

The app will live update as users solve problems and show how many points everyone has along with their solutions to problems.
