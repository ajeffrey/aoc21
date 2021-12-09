function simulateGrowth(fish, days) {
  let counts = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  for (const f of fish) {
    counts[f] += 1;
  }

  for (let i = 0; i < days; i++) {
    const [breeding, ...newFish] = counts;
    newFish.push(breeding);
    newFish[6] += breeding;
    counts = newFish;
  }

  return counts.reduce((a, b) => a + b);
}

const fish = require("fs")
  .readFileSync("./inputs/d6.txt", "utf-8")
  .split(",")
  .map((n) => parseInt(n, 10));

console.log(simulateGrowth(fish.slice(), 80));
console.log(simulateGrowth(fish.slice(), 256));
