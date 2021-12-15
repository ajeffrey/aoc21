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
      const counter = {};
      for (const node of nodes) {
        if (isSmallCave(node)) {
          counter[node] = (counter[node] || 0) + 1;
        }
      }

      const repeats = Object.values(counter).filter((n) => n > 1).length;

      for (const next of nextSteps) {
        if (isSmallCave(next) && nodes.includes(next) && repeats > 0) {
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
