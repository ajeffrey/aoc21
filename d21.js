const ROLLS = [1, 2, 3]
  .flatMap((a) => [1, 2, 3].flatMap((b) => [1, 2, 3].map((c) => a + b + c)))
  .reduce((acc, n) => {
    acc[n] = (acc[n] || 0) + 1;
    return acc;
  }, {});

function deterministicDirac(input) {
  const positions = input
    .split("\n")
    .map((s) => parseInt(s.match(/position: (\d+)$/)[1], 10));
  let score = [0, 0];
  let dice = 1;

  while (score.every((s) => s < 1000)) {
    for (let p = 0; p < 2; p++) {
      const roll = dice++ + dice++ + dice++;
      positions[p] = ((positions[p] + roll - 1) % 10) + 1;
      score[p] += positions[p];
      if (score[p] >= 1000) {
        return score[p === 0 ? 1 : 0] * (dice - 1);
      }
    }
  }
}

function getOutcomes(t, p, s, q, cache) {
  const outcomes = [0n, 0n];

  const key = `${t}:${p.join(",")}:${s.join(",")}:${q}`;

  if (key in cache) {
    return cache[key];
  }

  if (s[t === 0 ? 1 : 0] >= 21) {
    outcomes[t === 0 ? 1 : 0] = q;
    cache[key] = outcomes;
    return outcomes;
  }

  for (const r in ROLLS) {
    const nt = t === 0 ? 1 : 0;
    const np = p.slice();
    const ns = s.slice();
    const nq = q * BigInt(ROLLS[r]);
    np[t] = ((p[t] + +r - 1) % 10) + 1;
    ns[t] += np[t];
    const [p1, p2] = getOutcomes(nt, np, ns, nq, cache);
    outcomes[0] += p1;
    outcomes[1] += p2;
  }

  cache[key] = outcomes;
  return outcomes;
}

function quantumDirac(input) {
  const positions = input
    .split("\n")
    .map((s) => parseInt(s.match(/position: (\d+)$/)[1], 10));
  const cache = {};
  return getOutcomes(0, positions.slice(), [0, 0], 1n, cache);
}

console.log(
  deterministicDirac(`Player 1 starting position: 4
Player 2 starting position: 5`)
);

console.log(
  quantumDirac(`Player 1 starting position: 4
Player 2 starting position: 5`)
);
