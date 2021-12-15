function polymerise(input, steps) {
  let [templateStr, rulesStr] = input.split("\n\n");

  let template = templateStr.split("");

  const rules = rulesStr.split("\n").reduce((rules, row) => {
    const [pair, insert] = row.split(" -> ");
    rules[pair] = insert;
    return rules;
  }, {});

  for (let i = 0; i < steps; i++) {
    const l = template.length - 1;

    for (let j = 0; j < l; j++) {
      const pair = template.slice(j * 2, j * 2 + 2);
      const insert = rules[pair.join("")];
      if (insert) {
        template.splice(j * 2 + 1, 0, insert);
      } else {
        console.log("no insertion for " + pair);
      }
    }
  }

  const counter = template.reduce((acc, char) => {
    acc[char] = acc[char] || 0;
    acc[char]++;
    return acc;
  }, {});

  const pairs = Object.entries(counter).sort((a, b) => a[1] - b[1]);
  return pairs[pairs.length - 1][1] - pairs[0][1];
}

function polymeriseFast(input, steps) {
  let [template, rulesStr] = input.split("\n\n");

  const rules = rulesStr.split("\n").reduce((rules, row) => {
    const [pair, insert] = row.split(" -> ");
    rules[pair] = insert;
    return rules;
  }, {});

  let count = {};
  for (let i = 1; i < template.length; i++) {
    const pair = template.substr(i - 1, 2);
    count[pair] = (count[pair] || 0) + 1;
  }

  for (let i = 0; i < steps; i++) {
    const next = {};
    for (const pair of Object.keys(count)) {
      const insertion = rules[pair];
      const a = pair[0] + insertion;
      const b = insertion + pair[1];
      next[a] = (next[a] || 0) + count[pair];
      next[b] = (next[b] || 0) + count[pair];
    }

    count = next;
  }

  const charcount = Object.keys(count).reduce((acc, key) => {
    acc[key[0]] = (acc[key[0]] || 0) + count[key] / 2;
    acc[key[1]] = (acc[key[1]] || 0) + count[key] / 2;
    return acc;
  }, {});

  charcount[template[0]] += 0.5;
  charcount[template[template.length - 1]] += 0.5;

  const pairs = Object.entries(charcount).sort((a, b) => a[1] - b[1]);
  return pairs[pairs.length - 1][1] - pairs[0][1];
}

const input = require("fs").readFileSync("inputs/d14.txt", "utf-8");

console.log(polymerise(input, 10));
console.log(polymeriseFast(input, 10));
console.log(polymeriseFast(input, 40));
