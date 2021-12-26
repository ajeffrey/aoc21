const assert = require("assert");

const NEIGHBOURS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
];

const neighbours = ([x, y]) => NEIGHBOURS.map(([nx, ny]) => [x + nx, y + ny]);

const TYPES = ["A", "B", "C", "D"];
const COSTS = {
  A: 1,
  B: 10,
  C: 100,
  D: 1000,
};

// sort by value descending, then cost ascending
function sortByCost(a, b) {
  const vd = b.value - a.value;
  return vd === 0 ? a.cost - b.cost : vd;
}

function at([x, y], graph) {
  return graph[`${x},${y}`];
}

function getValue(state) {
  const { pods, graph } = state;
  let value = 0;
  for (const pod of pods) {
    const cell = at(pod.p, graph);
    if (cell.k === "room" && isFinalDestination(pod.p, pod, state)) {
      value += 1;
    }
  }

  return value;
}

function isValidStep(coord, pod, occupied, { graph }) {
  const id = coord2id(coord);
  // collides with other 'pod
  if (occupied.has(id)) {
    return false;
  }

  // only allow stepping in another room on the very first step
  const cell = at(coord, graph);
  if (cell.k === "room" && cell.t !== pod.t && pod.s !== "init") {
    return false;
  }

  return true;
}

function isFinalDestination(coord, pod, { graph, pods }) {
  const cell = at(coord, graph);
  if (!(cell.k === "room" && cell.t === pod.t)) {
    return false;
  }

  for (let i = 1; ; i++) {
    const below = [coord[0], coord[1] + i];
    const bcell = at(below, graph);
    if (!bcell) {
      return true;
    }

    if (!pods.find((p) => p.t === pod.t && coord2id(p.p) === coord2id(below))) {
      return false;
    }
  }
}

function isValidDestination(coord, pod, state) {
  if (pod.s === "init") {
    const { graph } = state;
    const cell = at(coord, graph);
    if (cell.k === "hall" && cell.e) {
      return false;
    }

    return true;
  } else {
    return isFinalDestination(coord, pod, state);
  }
}

function moveTo(coord, pod) {
  if (pod.s === "init") {
    return { ...pod, s: "hall", p: coord };
  } else if (pod.s === "hall") {
    return { ...pod, s: "end", p: coord };
  }
}

function coord2id(coord) {
  return `${coord[0]},${coord[1]}`;
}

function validMoves(state) {
  const { pods, cost, graph, moves } = state;
  const next = [];
  const movers = pods.filter((p) => p.s !== "end");
  const occupied = new Set(pods.map((p) => coord2id(p.p)));
  for (const pod of movers) {
    const node = at(pod.p, graph);
    const open = [
      ...node.edges
        .filter((e) => isValidStep(e, pod, occupied, state))
        .map((e) => [e]),
    ];
    const checked = new Set([coord2id(pod.p)]);
    while (open.length > 0) {
      const path = open.pop();
      const coord = path[path.length - 1];
      checked.add(coord2id(coord));
      if (!isValidStep(coord, pod, occupied, state)) {
        continue;
      }

      const cell = at(coord, graph);
      open.push(
        ...cell.edges
          .filter((e) => !checked.has(coord2id(e)))
          .map((e) => [...path, e])
      );

      if (isValidDestination(coord, pod, state)) {
        const newState = {
          cost: cost + path.length * COSTS[pod.t],
          moves: [
            ...moves,
            { id: pod.id, t: pod.t, from: pod.p, to: coord.slice() },
          ],
          pods: pods.map((p) => (p.id === pod.id ? moveTo(coord, pod) : p)),
          graph,
        };

        newState.value = getValue(newState);
        next.push(newState);
      }
    }
  }

  return next;
}

function hashState({ pods }) {
  return pods
    .map((p) => `${p.t}:${coord2id(p.p)}`)
    .sort()
    .join(";");
}

function print({ pods, value, cost, graph, moves }) {
  const coords = Object.keys(graph).map((id) =>
    id.split(",").map((n) => parseInt(n, 10))
  );
  const maxX = Math.max(...coords.map(([x]) => x));
  const maxY = Math.max(...coords.map(([x, y]) => y));
  const podIndex = pods.reduce((a, p) => {
    a[coord2id(p.p)] = p.t;
    return a;
  }, {});

  const final = pods.filter((p) => isFinalDestination(p.p, p, { graph, pods }));
  console.log(
    `$ ${final.length}` +
      final.map((p) => `${p.t} [${p.p[0]},${p.p[1]}]`).join(", ")
  );

  console.log(
    `@${value}:${cost} (${moves.length}): ` +
      moves
        .map(
          (m) => `${m.t} [${m.from[0]},${m.from[1]}] => [${m.to[0]},${m.to[1]}]`
        )
        .join(", ")
  );
  for (let y = 0; y <= maxY + 1; y++) {
    for (let x = 0; x <= maxX + 1; x++) {
      const id = coord2id([x, y]);
      let char = "#";
      if (id in podIndex) {
        char = podIndex[id];
      } else if (id in graph) {
        char = graph[id].e ? "v" : ".";
      }

      process.stdout.write(char);
    }

    process.stdout.write("\n");
  }
  console.log("\n");
}

function isComplete({ pods, graph }) {
  return pods.every((pod) => {
    const cell = at(pod.p, graph);
    return cell.k === "room" && cell.t === pod.t;
  });
}

function parseInput(input) {
  const rows = input.split("\n").map((row) => row.split(""));
  const graph = {};
  const roomIndices = [];
  const pods = [];
  let pid = 0;
  for (let y = 0; y < rows.length; y++) {
    for (let x = 0; x < rows[y].length; x++) {
      const cell = rows[y][x];
      if (cell.match(/^[.ABCD]$/)) {
        const node = (graph[`${x},${y}`] = {});
        if (cell === ".") {
          node.k = "hall";
          node.e = false;
        } else {
          const room =
            TYPES[
              roomIndices.includes(x)
                ? roomIndices.indexOf(x)
                : roomIndices.push(x) - 1
            ];
          node.k = "room";
          node.t = room;
          pods.push({ t: cell, id: pid++, s: "init", p: [x, y] });
        }

        node.edges = [];
        for (const n of neighbours([x, y])) {
          const [nx, ny] = n;
          const ncell = rows[ny] && rows[ny][nx];
          if (ncell && ncell.match(/^[.ABCD]$/)) {
            // mark up halls that are room entrances (no stopping)
            if (ncell !== "." && node.k === "hall") {
              node.e = true;
            }
            node.edges.push(n);
          }
        }
      }
    }
  }

  return { graph, pods };
}

function sortAmphipods(input) {
  const { graph, pods } = parseInput(input);

  const initial = { pods, value: 0, cost: 0, graph, moves: [] };
  for (const pod of pods) {
    if (isFinalDestination(pod.p, pod, initial)) {
      pod.s = "end";
    }
  }

  const states = validMoves(initial).sort(sortByCost);

  const memo = {};
  let best = Infinity;

  // process.exit(-1);
  let processed = 0;
  let skipped = 0;
  let improved = 0;
  let longest = states[0];

  const attacked = {};

  while (states.length > 0) {
    const state = states.pop();
    const hash = hashState(state);
    if (hash in memo) {
      if (memo[hash] <= state.cost) {
        // console.log('skipped dupe');
        skipped += 1;
        continue;
      } else {
        improved += 1;
      }
    }

    console.log(hash);

    if (state.moves.length > longest.moves.length) {
      longest = state;
    }

    memo[hash] = state.cost;

    if (isComplete(state)) {
      print(state);
      if (state.cost < best) {
        best = state.cost;
      }
      continue;
    }

    // print(state);
    const newMoves = validMoves(state).filter((m) => {
      const hash = hashState(m);
      return !(hash in memo && memo[hash] <= m.cost);
    });
    states.push(...newMoves);
    states.sort((a, b) => {
      return -(a.value - b.value);
    });
    // for(const move of newMoves) {
    //   const lm = states[states.length - 1];
    //   if(!lm) {
    //     console.log('emptied out at ' + processed);
    //     states.push(move);
    //     continue;

    //   } else if(lm.value > move.value) {
    //     states.push(move);
    //     console.log('bad move');
    //     continue;
    //   }
    //   for(let i = 0; i < states.length; i++) {
    //     const s = states[i];
    //     if(s.value < move.value) {
    //       states.splice(i, 0, move);
    //       break;
    //     }
    //   }
    // }

    processed += 1;
    attacked[state.value] = (attacked[state.value] || 0) + 1;
    if (processed % 1000 === 0) {
      const next = states[states.length - 1];
      console.log(processed, best, next.moves.length, attacked);
      print(next);
    }
  }

  if (states.length > 0) {
    console.log("done!");
    print(states[0]);
  }

  console.log(processed);

  return best;
}

const eg = `
#############
#...........#
###B#C#B#D###
  #D#C#B#A#
  #D#B#A#C#
  #A#D#C#A#  
  #########  `.trim();

const input = `
#############
#...........#
###D#A#C#A###
  #D#C#B#A#
  #D#B#A#C#
  #D#C#B#B#
  #########`.trim();

// @2222:19185 (12): A [9,2] => [2,1], B [9,3] => [10,1], D [3,2] => [9,3], D [3,3] => [9,2], A [2,1] => [3,3], A [5,2] => [3,2], C [7,2] => [6,1], B [7,3] => [8,1], C [6,1] => [7,3], C [5,3] => [7,2], B [8,1] => [5,3], B [10,1] => [5,2]

console.log(sortAmphipods(eg));
// console.log(sortAmphipods(input));
