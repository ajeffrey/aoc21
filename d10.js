const debug = require("debug")("true");

const OPENERS = "([{<".split("");
const CLOSERS = ")]}>".split("");

const PRICE = {
  ")": 3,
  "]": 57,
  "}": 1197,
  ">": 25137,
};

const PRICE_2 = {
  "(": 1,
  "[": 2,
  "{": 3,
  "<": 4,
};

function findErrors(lines) {
  let total = 0;

  for (const line of lines) {
    const stack = [];
    for (let i = 0; i < line.length; i++) {
      debug(line[i]);
      if (OPENERS.includes(line[i])) {
        stack.push(line[i]);
      } else if (CLOSERS.includes(line[i])) {
        const match = OPENERS[CLOSERS.indexOf(line[i])];
        if (stack[stack.length - 1] === match) {
          stack.pop();
        } else {
          total += PRICE[line[i]];
          break;
        }
      }
      debug(`"${stack.join("")}"`);
    }
  }

  return total;
}

function fixErrors(lines) {
  const scores = [];

  for (const line of lines) {
    const stack = [];
    let illegal = false;

    for (let i = 0; i < line.length; i++) {
      debug(line[i]);
      if (OPENERS.includes(line[i])) {
        stack.push(line[i]);
      } else if (CLOSERS.includes(line[i])) {
        const match = OPENERS[CLOSERS.indexOf(line[i])];
        if (stack[stack.length - 1] === match) {
          stack.pop();
        } else {
          illegal = true;
          break;
        }
      }
      debug(`"${stack.join("")}"`);
    }

    if (!illegal && stack.length > 0) {
      let lineTotal = 0,
        char = null;
      while ((char = stack.pop())) {
        lineTotal = lineTotal * 5 + PRICE_2[char];
      }

      scores.push(lineTotal);
    }
  }

  return scores.sort((a, b) => a - b)[Math.floor(scores.length / 2)];
}

const lines = require("fs").readFileSync("inputs/d10.txt", "utf-8").split("\n");

console.log(findErrors(lines));
console.log(fixErrors(lines));
