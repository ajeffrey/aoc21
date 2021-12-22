function rotate(vec, axis) {
  const val = vec[axis];
  vec.splice(axis, 1);
  [vec[0], vec[1]] = [-vec[1], vec[0]];
  vec.splice(axis, 0, val);
  return vec;
}

function perspectives(vecs) {
  let ps = new Array(24).fill("").map((_) => []);
  for (let i = 0; i < vecs.length; i++) {
    let vec = [...vecs[i]];
    let j = 0;
    for (let z = 0; z < 2; z++) {
      rotate(vec, 2);
      for (let y = 0; y < 4; y++) {
        rotate(vec, 1);
        for (let x = 0; x < 4; x++) {
          if (z === 0 && y % 2 === 0) continue; // I don't know why this works, but it does
          rotate(vec, 0);
          ps[j].push([...vec]);
          j++;
        }
      }
    }
  }
  return ps;
}

function toVectors(vecs) {
  const diffs = {};
  for (let i = 0; i < vecs.length - 1; i++) {
    for (let j = i + 1; j < vecs.length; j++) {
      const diff = dist(vecs[i], vecs[j]);
      diffs[diff] = [vecs[i], vecs[j]];
    }
  }

  return diffs;
}

function add3(a, b) {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

function sub3(a, b) {
  return [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
}

function dist(a, b) {
  return Math.sqrt(
    Math.pow(a[0] - b[0], 2) +
      Math.pow(a[1] - b[1], 2) +
      Math.pow(a[2] - b[2], 2)
  );
}

function doThing(input) {
  const scanners = input.split("\n\n").map((block) =>
    block
      .split("\n")
      .slice(1)
      .map((coords) => coords.split(",").map((n) => parseInt(n, 10)))
  );
  let total = scanners.reduce((a, b) => a + b.length, 0);
  console.log("total beacons detected: " + total);
  for (let i = 0; i < scanners.length - 1; i++) {
    for (let j = i + 1; j < scanners.length; j++) {
      if (i === j) continue;
      let A = toVectors(scanners[i]),
        B = scanners[j];
      const ps = perspectives(B);
      for (const perspective of ps) {
        const Bp = toVectors(perspective);
        const overlaps = Object.keys(Bp).filter((bp) => bp in A);
        const vertices = new Set();
        for (const overlap of overlaps) {
          const bpair = Bp[overlap];
          vertices.add(bpair[0].join(","));
          vertices.add(bpair[1].join(","));
        }

        if (vertices.size >= 12) {
          console.log(`scanner ${j} overlaps ${i} ${vertices.size} times`);
          total -= vertices.size;
          break;
        }
      }
    }
  }

  console.log(total);
}

const input = require("fs").readFileSync("inputs/d19.txt", "utf-8");

console.log(doThing(input));
