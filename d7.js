function alignCrabs(positions) {
  const min = Math.min(...positions);
  const max = Math.max(...positions);
  let total = Infinity;
  for (let i = min; i <= max; i++) {
    const posTotal = positions
      .map((p) => Math.abs(p - i))
      .reduce((a, b) => a + b);
    total = Math.min(total, posTotal);
  }

  return total;
}

function alignCrabsPoly(positions) {
  const min = Math.min(...positions);
  const max = Math.max(...positions);
  let total = Infinity;
  for (let i = min; i <= max; i++) {
    const posTotal = positions
      .map((p) => {
        const d = Math.abs(p - i);
        return (d * (d + 1)) / 2;
      })
      .reduce((a, b) => a + b);
    total = Math.min(total, posTotal);
  }

  return total;
}

const positions = require("fs")
  .readFileSync("inputs/d7.txt", "utf-8")
  .split(",")
  .map((n) => parseInt(n, 10));

console.log(alignCrabs(positions));
console.log(alignCrabsPoly(positions));
