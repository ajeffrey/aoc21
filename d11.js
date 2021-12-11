function flashOctopi(octopi, steps) {
  let flashes = 0;

  for (let i = 0; i < steps; i++) {
    // increment all octopi
    everyInGrid(octopi, ([x, y]) => (octopi[y][x] = octopi[y][x] + 1));

    let nines;
    do {
      nines = 0;
      everyInGrid(octopi, ([x, y]) => {
        if (octopi[y][x] > 9) {
          nines += 1;

          for (const [nx, ny] of neighbours(octopi, [x, y])) {
            if (octopi[ny][nx] !== "F") {
              octopi[ny][nx] += 1;
            }
          }

          octopi[y][x] = "F";
        }
      });

      flashes += nines;
    } while (nines > 0);

    everyInGrid(octopi, ([x, y]) => {
      if (octopi[y][x] === "F") {
        octopi[y][x] = 0;
      }
    });
  }

  return flashes;
}

function syncOctopi(octopi) {
  const size = octopi.reduce((a, b) => a + b.length, 0);

  for (let step = 1; ; step++) {
    let flashes = 0;

    // increment all octopi
    everyInGrid(octopi, ([x, y]) => (octopi[y][x] = octopi[y][x] + 1));

    let nines;
    do {
      nines = 0;
      everyInGrid(octopi, ([x, y]) => {
        if (octopi[y][x] > 9) {
          nines += 1;

          for (const [nx, ny] of neighbours(octopi, [x, y])) {
            if (octopi[ny][nx] !== "F") {
              octopi[ny][nx] += 1;
            }
          }

          octopi[y][x] = "F";
        }
      });

      flashes += nines;
    } while (nines > 0);

    everyInGrid(octopi, ([x, y]) => {
      if (octopi[y][x] === "F") {
        octopi[y][x] = 0;
      }
    });

    if (flashes === size) {
      return step;
    }
  }
}

function everyInGrid(grid, fn) {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      fn([x, y]);
    }
  }
}

function neighbours(grid, [x, y]) {
  return [-1, 0, 1]
    .flatMap((nx) => [-1, 0, 1].map((ny) => [nx, ny]))
    .filter(([nx, ny]) => nx != 0 || ny != 0)
    .map(([nx, ny]) => [x + nx, y + ny])
    .filter(([nx, ny]) => ny in grid && nx in grid[ny]);
}

const octopi = () =>
  require("fs")
    .readFileSync("inputs/d11.txt", "utf-8")
    .split("\n")
    .map((row) => row.split("").map((n) => parseInt(n, 10)));

console.log(flashOctopi(octopi(), 100));
console.log(syncOctopi(octopi()));
