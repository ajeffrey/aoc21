const chalk = require("chalk");
const assert = require("assert");

const MIN = -50;
const MAX = 50;

function* range(mins, maxs) {
  const min = parseInt(mins, 10);
  const max = parseInt(maxs, 10);
  if (min < MIN && max < MIN) return [];
  if (min > MAX && max > MAX) return [];

  let i = min < MIN ? MIN : min;
  while (i <= (max > MAX ? MAX : max)) {
    yield i;
    i++;
  }
}

function initialiseReactor(input) {
  const steps = input
    .split("\n")
    .map((step) =>
      step.match(
        /^(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)$/
      )
    );
  const reactor = {};
  for (let z = MIN; z <= MAX; z++) {
    for (let y = MIN; y <= MAX; y++) {
      for (let x = MIN; x <= MAX; x++) {
        reactor[z] = reactor[z] || {};
        reactor[z][y] = reactor[z][y] || {};
        reactor[z][y][x] = 0;
      }
    }
  }

  for (const [_, val, x1, x2, y1, y2, z1, z2] of steps) {
    let bool = val === "on" ? 1 : 0;
    for (const z of range(z1, z2)) {
      for (const y of range(y1, y2)) {
        for (const x of range(x1, x2)) {
          reactor[y][z][x] = bool;
        }
      }
    }
  }

  let total = 0;
  for (let z = MIN; z <= MAX; z++) {
    for (let y = MIN; y <= MAX; y++) {
      for (let x = MIN; x <= MAX; x++) {
        total += reactor[z][y][x];
      }
    }
  }

  return total;
}

function area(cube) {
  return BigInt(
    (cube.z[1] - cube.z[0] + 1) *
      (cube.y[1] - cube.y[0] + 1) *
      (cube.x[1] - cube.x[0] + 1)
  );
}

function print(cube) {
  return `[${cube.x[0]}..${cube.x[1]}, ${cube.y[0]}..${cube.y[1]}, ${
    cube.z[0]
  }..${cube.z[1]}] (${chalk.yellow(area(cube))})`;
}

function printWithin(child, parent) {
  const link = (c, i) => {
    const a = child[c][i];
    const b = parent[c][i];
    if (a === b) {
      return chalk.green(a);
    } else {
      return a;
    }
  };
  return `[${link("x", 0)}..${link("x", 1)}, ${link("y", 0)}..${link(
    "y",
    1
  )}, ${link("z", 0)}..${link("z", 1)}] (${chalk.yellow(area(child))})`;
}

function valid(cube) {
  return (
    cube.x[1] >= cube.x[0] && cube.y[1] >= cube.y[0] && cube.z[1] >= cube.z[0]
  );
}

function subtract(s, o) {
  if (
    s.x[0] <= o.x[1] &&
    s.x[1] >= o.x[0] &&
    s.y[0] <= o.y[1] &&
    s.y[1] >= o.y[0] &&
    s.z[0] <= o.z[1] &&
    s.z[1] >= o.z[0]
  ) {
    const intersection = {
      x: [Math.max(s.x[0], o.x[0]), Math.min(s.x[1], o.x[1])],
      y: [Math.max(s.y[0], o.y[0]), Math.min(s.y[1], o.y[1])],
      z: [Math.max(s.z[0], o.z[0]), Math.min(s.z[1], o.z[1])],
    };

    const x = [Math.max(o.x[0], s.x[0]), Math.min(o.x[1], s.x[1])];
    const y = [Math.max(o.y[0], s.y[0]), Math.min(o.y[1], s.y[1])];

    const difference = [
      { x: [s.x[0], o.x[0] - 1], y: s.y.slice(), z: s.z.slice() },
      { x: [o.x[1] + 1, s.x[1]], y: s.y.slice(), z: s.z.slice() },
      { x, y: [s.y[0], o.y[0] - 1], z: s.z.slice() },
      { x, y: [o.y[1] + 1, s.y[1]], z: s.z.slice() },
      { x, y, z: [s.z[0], o.z[0] - 1] },
      { x, y, z: [o.z[1] + 1, s.z[1]] },
    ].filter(valid);

    return { intersection, difference };
  }

  return { intersection: null, difference: [s] };
}

function rebootReactor(input) {
  const cubes = input.split("\n").map((step) => {
    let [_, val, ...coords] = step.match(
      /^(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)$/
    );
    let [x1, x2, y1, y2, z1, z2] = coords.map((n) => parseInt(n, 10));
    return {
      val,
      x: [x1, x2].sort((a, b) => a - b),
      y: [y1, y2].sort((a, b) => a - b),
      z: [z1, z2].sort((a, b) => a - b),
    };
  });

  let pieces = [];
  for (const cube of cubes) {
    pieces = pieces.flatMap((piece) => {
      const { intersection, difference } = subtract(piece, cube);
      if (!intersection) {
        return [piece];
      }

      if (
        !(
          area(intersection) + difference.reduce((a, b) => a + area(b), 0n) ===
          area(piece)
        )
      ) {
        console.log(print(piece), "-", print(cube));
        console.log("intersection: ", printWithin(intersection, piece));
        console.log("differences: " + difference.length);
        difference.forEach((r) => console.log(printWithin(r, piece)));
        process.exit(-1);
      }
      return difference;
    });

    if (cube.val === "on") {
      pieces.push(cube);
    }
  }

  const total = pieces.reduce((a, b) => a + area(b), 0n);

  return total;
}

const eg = require("fs").readFileSync("inputs/e22.txt", "utf-8");
const input = require("fs").readFileSync("inputs/d22.txt", "utf-8");

assert(area({ x: [1, 1], y: [1, 1], z: [1, 1] }) === 1n);
assert(area({ x: [1, 3], y: [1, 3], z: [1, 3] }) === 27n);
assert(
  subtract(
    { x: [1, 3], y: [1, 3], z: [1, 3] },
    { x: [1, 1], y: [1, 1], z: [1, 1] }
  ).difference.reduce((a, b) => a + area(b), 0n) === 26n
);

console.log(initialiseReactor(input));
console.log(rebootReactor(input));
