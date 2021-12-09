const countIncreases = (pings) => {
  let increases = 0;
  for (let i = 1; i < pings.length; i++) {
    if (pings[i] > pings[i - 1]) increases += 1;
  }
  return increases;
};

const countWindowIncreases = (pings) => {
  let increases = 0;
  for (let i = 3; i < pings.length; i++) {
    const w1 = pings[i - 3] + pings[i - 2] + pings[i - 1];
    const w2 = pings[i - 2] + pings[i - 1] + pings[i];
    if (w1 < w2) increases += 1;
  }
  return increases;
};

const pings = require("fs")
  .readFileSync("inputs/d1.txt", "utf-8")
  .split(/\s+/)
  .filter((n) => n.match(/^\d+$/))
  .map((n) => parseInt(n, 10));

console.log(countIncreases(pings));
console.log(countWindowIncreases(pings));
