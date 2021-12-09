const UNIQUES = [7, 4, 3, 2];

const CODE2CHAR = {
  cf: 1,
  acf: 7,
  bcdf: 4,
  acdeg: 2,
  acdfg: 3,
  abdfg: 5,
  abcdfg: 9,
  abcefg: 0,
  abdefg: 6,
  abcdefg: 8,
};

function count1478(lines) {
  let uniqueCount = 0;
  for (const line of lines) {
    const [digits, codes] = line.split(" | ").map((p) => p.split(" "));
    for (const code of codes) {
      if (UNIQUES.includes(code.length)) {
        uniqueCount++;
      }
    }
  }

  return uniqueCount;
}

function decodeAll(lines) {
  let count = 0;
  for (const line of lines) {
    const [digits, codes] = line.split(" | ").map((p) => p.split(" "));
    const map = {};
    const counter = {};
    for (const char of digits.flatMap((d) => d.split(""))) {
      counter[char] = counter[char] || 0;
      counter[char] += 1;
    }

    const one = digits.find((d) => d.length === 2).split("");
    const four = digits.find((d) => d.length === 4).split("");
    const seven = digits.find((d) => d.length === 3).split("");
    const eight = digits.find((d) => d.length === 7).split("");
    map.a = seven.find((c) => !one.includes(c));
    map.b = Object.keys(counter).find((k) => counter[k] === 6);
    map.e = Object.keys(counter).find((k) => counter[k] === 4);
    map.f = Object.keys(counter).find((k) => counter[k] === 9);
    map.c = one.find((c) => c !== map.f);
    map.d = four.find((c) => ![map.b, map.c, map.f].includes(c));
    map.g = eight.find(
      (c) =>
        !"abcdef"
          .split("")
          .map((cd) => map[cd])
          .includes(c)
    );

    const decoded = codes
      .map((code) => {
        const chars = code
          .split("")
          .map((c) => Object.keys(map).find((k) => map[k] === c))
          .sort()
          .join("");
        return CODE2CHAR[chars];
      })
      .join("");
    console.log(decoded);

    count += parseInt(decoded, 10);
  }

  return count;
}

const lines = require("fs").readFileSync("inputs/d8.txt", "utf-8").split("\n");

console.log(count1478(lines));
console.log(decodeAll(lines));
