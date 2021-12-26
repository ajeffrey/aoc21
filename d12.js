function countPaths(text) {
  const edges = text.split("\n");
  const graph = constructGraph(edges);

  let paths = [["start"]];
  let completePaths = [];

  do {
    let nextPaths = [];
    for (const nodes of paths) {
      const node = nodes[nodes.length - 1];
      const nextSteps = graph[node];

      for (const next of nextSteps) {
        if (isSmallCave(next) && nodes.includes(next)) {
          continue;
        }

        const path = [...nodes, next];
        (next === "end" ? completePaths : nextPaths).push(path);
      }
    }

    paths = nextPaths;
  } while (paths.length > 0);

  return completePaths.length;
}

function countPathsV2(text) {
  const edges = text.split("\n");
  const graph = constructGraph(edges);

  let paths = [["start"]];
  let completePaths = [];

  do {
    let nextPaths = [];
    for (const nodes of paths) {
      const node = nodes[nodes.length - 1];
      const nextSteps = graph[node].filter((next) => next !== "start");
      const counter = new Set();
      let repeated = false;
      for (const node of nodes) {
        if (!repeated && isSmallCave(node)) {
          if (counter.has(node)) {
            repeated = true;
          } else {
            counter.add(node);
          }
        }
      }

      for (const next of nextSteps) {
        if (isSmallCave(next) && nodes.includes(next) && repeated) {
          continue;
        }

        const path = [...nodes, next];
        (next === "end" ? completePaths : nextPaths).push(path);
      }
    }

    paths = nextPaths;
  } while (paths.length > 0);

  return completePaths.length;
}

function isSmallCave(node) {
  return node.match(/^[a-z]+$/);
}

function constructGraph(edges) {
  const graph = {};

  for (const edge of edges) {
    const [from, to] = edge.split("-");
    graph[from] = graph[from] || [];
    graph[to] = graph[to] || [];
    graph[from].push(to);
    graph[to].push(from);
  }

  return graph;
}

const paths = require("fs").readFileSync("inputs/d12.txt", "utf-8");

console.log(countPaths(paths));
console.log(countPathsV2(paths));
