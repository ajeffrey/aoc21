const assert = require("assert");
const debug = require("debug")("true");

class Conductor {
  constructor(root) {
    this.root = root;
    this.indices = [0];
  }

  depth() {
    return this.indices.length;
  }

  clone() {
    const copy = new Conductor(this.root);
    copy.indices = this.indices.slice();
    return copy;
  }

  reset() {
    this.indices = [0];
  }

  up() {
    this.indices.pop();
  }

  val() {
    return this.indices.reduce((p, i) => p[i], this.root);
  }

  set(val) {
    const ancestry = this.indices.slice();
    const index = ancestry.pop();
    const parent = ancestry.reduce((p, i) => p[i], this.root);
    parent[index] = val;
  }

  next() {
    const val = this.val();
    if (Array.isArray(val)) {
      this.indices.push(0);
      return this.val();
    }

    while (this.indices.length > 0) {
      this.indices[this.indices.length - 1] += 1;
      const val = this.val();
      if (val === undefined) {
        this.indices.pop();
      } else {
        return val;
      }
    }

    return undefined;
  }

  skip() {
    this.indices[this.indices.length - 1] += 1;
    while (this.val() === undefined && this.indices.length > 1) {
      this.indices.pop();
      this.indices[this.indices.length - 1] += 1;
    }

    return this.val();
  }

  // [[0 0] [[0 [0 0]] 0]]
  // 0 0,0 0,1 1 1,0 1,0,0 1,0,1 1,0,1,0 1,0,1,1 1,1
  // 1,1 1,0,1,1
  prev() {
    if (this.indices[this.indices.length - 1] > 0) {
      this.indices[this.indices.length - 1] -= 1;
      let val = this.val();
      while (Array.isArray(val)) {
        this.indices.push(val.length - 1);
        val = this.val();
      }
      return val;
    } else if (this.indices.length > 0) {
      this.indices.pop();
      return this.val();
    }

    return undefined;
  }
}

function reduce(root) {
  debug("reducing", root);
  const cond = new Conductor(root);
  let val = cond.val();
  while (val !== undefined) {
    if (cond.depth() === 4 && Array.isArray(val)) {
      debug(`found explodable at ${cond.indices}`);
      const left = cond.clone();
      let leftval = left.prev();
      while (leftval !== undefined) {
        if (typeof leftval === "number") {
          left.set(leftval + val[0]);
          debug(`L: added ${val[0]} to ${leftval} at ${left.indices}`);
          break;
        }
        leftval = left.prev();
      }

      const right = cond.clone();
      let rightval = right.skip();
      while (rightval !== undefined) {
        if (typeof rightval === "number") {
          right.set(rightval + val[1]);
          debug(`R: added ${val[1]} to ${rightval} at ${right.indices}`);
          break;
        }
        rightval = right.next();
      }

      cond.set(0);
      return [root, "explode"];
    }

    val = cond.next();
  }

  cond.reset();
  val = cond.val();
  while (val !== undefined) {
    if (typeof val === "number" && val > 9) {
      debug(`found splittable at ${cond.indices}`);
      const half = val / 2;
      cond.set([Math.floor(half), Math.ceil(half)]);
      return [root, "split"];
    }

    val = cond.next();
  }

  return [root, false];
}

function add(a, b) {
  const result = JSON.parse(JSON.stringify([a, b]));
  let changed, root;
  do {
    [root, changed] = reduce(result);
    debug(changed, root);
  } while (changed);

  return root;
}

function mag(number) {
  if (typeof number === "number") return number;
  return 3 * mag(number[0]) + 2 * mag(number[1]);
}

function addAll(list) {
  return list.reduce((a, b) => add(a, b));
}

function highestMag(list) {
  let max = 0;
  let maxsum = null;
  for (let i = 0; i < list.length - 1; i++) {
    for (let j = i + 1; j < list.length; j++) {
      let sum = mag(add(list[i], list[j]));
      if (sum > max) {
        max = sum;
        maxsum = [list[i], list[j]];
      }
      sum = mag(add(list[j], list[i]));
      if (sum > max) {
        max = sum;
        maxsum = [list[i], list[j]];
      }
    }
  }

  return [max, maxsum];
}

const test = (actual, expected) => {
  assert(
    JSON.stringify(actual) === JSON.stringify(expected),
    `expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`
  );
};

test(reduce([[[[[9, 8], 1], 2], 3], 4])[0], [[[[0, 9], 2], 3], 4]);
test(reduce([7, [6, [5, [4, [3, 2]]]]])[0], [7, [6, [5, [7, 0]]]]);
test(reduce([[6, [5, [4, [3, 2]]]], 1])[0], [[6, [5, [7, 0]]], 3]);
test(
  reduce([
    [3, [2, [1, [7, 3]]]],
    [6, [5, [4, [3, 2]]]],
  ])[0],
  [
    [3, [2, [8, 0]]],
    [9, [5, [4, [3, 2]]]],
  ]
);
test(
  reduce([
    [3, [2, [8, 0]]],
    [9, [5, [4, [3, 2]]]],
  ])[0],
  [
    [3, [2, [8, 0]]],
    [9, [5, [7, 0]]],
  ]
);

test(
  add(
    [
      [[[4, 3], 4], 4],
      [7, [[8, 4], 9]],
    ],
    [1, 1]
  ),
  [
    [
      [[0, 7], 4],
      [
        [7, 8],
        [6, 0],
      ],
    ],
    [8, 1],
  ]
);
test(
  addAll([
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
  ]),
  [
    [
      [
        [1, 1],
        [2, 2],
      ],
      [3, 3],
    ],
    [4, 4],
  ]
);
test(
  addAll([
    [1, 1],
    [2, 2],
    [3, 3],
    [4, 4],
    [5, 5],
  ]),
  [
    [
      [
        [3, 0],
        [5, 3],
      ],
      [4, 4],
    ],
    [5, 5],
  ]
);
test(
  addAll([
    [
      [
        [0, [4, 5]],
        [0, 0],
      ],
      [
        [
          [4, 5],
          [2, 6],
        ],
        [9, 5],
      ],
    ],
    [
      7,
      [
        [
          [3, 7],
          [4, 3],
        ],
        [
          [6, 3],
          [8, 8],
        ],
      ],
    ],
    [
      [
        2,
        [
          [0, 8],
          [3, 4],
        ],
      ],
      [
        [[6, 7], 1],
        [7, [1, 6]],
      ],
    ],
    [
      [
        [[2, 4], 7],
        [6, [0, 5]],
      ],
      [
        [
          [6, 8],
          [2, 8],
        ],
        [
          [2, 1],
          [4, 5],
        ],
      ],
    ],
    [
      7,
      [
        5,
        [
          [3, 8],
          [1, 4],
        ],
      ],
    ],
    [
      [2, [2, 2]],
      [8, [8, 1]],
    ],
    [2, 9],
    [
      1,
      [
        [[9, 3], 9],
        [
          [9, 0],
          [0, 7],
        ],
      ],
    ],
    [[[5, [7, 4]], 7], 1],
    [
      [[[4, 2], 2], 6],
      [8, 7],
    ],
  ]),
  [
    [
      [
        [8, 7],
        [7, 7],
      ],
      [
        [8, 6],
        [7, 7],
      ],
    ],
    [
      [
        [0, 7],
        [6, 6],
      ],
      [8, 7],
    ],
  ]
);
test(
  mag([
    [1, 2],
    [[3, 4], 5],
  ]),
  143
);
test(
  mag([
    [
      [
        [8, 7],
        [7, 7],
      ],
      [
        [8, 6],
        [7, 7],
      ],
    ],
    [
      [
        [0, 7],
        [6, 6],
      ],
      [8, 7],
    ],
  ]),
  3488
);

const input = require("fs")
  .readFileSync("inputs/d18.txt", "utf-8")
  .split("\n")
  .map((n) => JSON.parse(n));
console.log(mag(addAll(input)));
console.log(highestMag(input));
