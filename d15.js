const N_VECTORS = [
  [1, 0],
  [0, 1],
  [-1, 0],
  [0, -1],
];

function searchRoute(input) {
  const grid = input
    .split("\n")
    .map((row) => row.split("").map((n) => parseInt(n, 10)));
  const w = grid[0].length,
    h = grid.length;

  const open = [[0, 0, 0]];
  do {
    const [x, y, cost] = open.shift();
    const neighbours = [
      [x + 1, y],
      [x, y + 1],
    ];
    for (const [nx, ny] of neighbours) {
      if (nx >= w || ny >= h) {
        continue;
      }

      const ncost = cost + grid[ny][nx];
      if (nx === w - 1 && ny === h - 1) {
        return ncost;
      }

      const n = [nx, ny, ncost];

      let inserted = false;
      for (let i = 0; i < open.length; i++) {
        if (open[i][0] === n[0] && open[i][1] === n[1] && open[i][2] <= n[2]) {
          inserted = true;
          break;
        }

        if (open[i][2] > ncost) {
          inserted = true;
          open.splice(i, 0, n);
          break;
        }
      }

      if (!inserted) {
        open.push(n);
      }
    }
  } while (open.length > 0);

  return null;
}

function searchBigRoute(input) {
  const partialGrid = input
    .split("\n")
    .map((row) => row.split("").map((n) => parseInt(n, 10)));
  const pw = partialGrid[0].length,
    ph = partialGrid.length;
  const w = pw * 5,
    h = ph * 5;

  const at = (x, y) => {
    const ix = x % pw,
      iy = y % ph;
    const pageX = Math.floor(x / pw),
      pageY = Math.floor(y / ph);
    return ((partialGrid[iy][ix] + pageX + pageY - 1) % 9) + 1;
  };

  const grid = [];
  const cost = [];
  for (let y = 0; y < h; y++) {
    grid.push([]);
    cost.push([]);
    for (let x = 0; x < w; x++) {
      grid[y].push(at(x, y));
      cost[y].push(Infinity);
    }
  }

  const t = Date.now();
  cost[0][0] = 0;
  for (let i = 0; i < 10; i++) {
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        if (y === 0 && x === 0) continue;
        const neighbours = N_VECTORS.map(([nx, ny]) => [x + nx, y + ny]).filter(
          ([nx, ny]) => nx >= 0 && nx < w && ny >= 0 && ny < h
        );
        cost[y][x] =
          grid[y][x] +
          Math.min(...neighbours.map(([nx, ny]) => cost[ny][nx]), cost[y][x]);
      }
    }
  }

  console.log(cost[h - 1][w - 1]);
  console.log(Date.now() - t + "ms");
}

const input = require("fs").readFileSync("inputs/d15.txt", "utf-8");

console.log(searchRoute(input));
console.log(searchBigRoute(input));
