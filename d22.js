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

function overlap(c1, c2) {}

function rebootReactor(input) {
  const steps = input
    .split("\n")
    .map((step) =>
      step.match(
        /^(on|off) x=(-?\d+)..(-?\d+),y=(-?\d+)..(-?\d+),z=(-?\d+)..(-?\d+)$/
      )
    );
  const cubes = [];
  for (const [_, val, x1, x2, y1, y2, z1, z2] of steps) {
    c;
  }
}

const input = require("fs").readFileSync("inputs/d22.txt", "utf-8");

console.log(initialiseReactor(input));
