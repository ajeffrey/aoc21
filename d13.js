function foldOnce(input) {
  const [dots, folds] = input.split("\n\n");
  const fold = folds.split("\n")[0];
  const [_, axis, coordStr] = fold.match(/^fold along (x|y)=(\d+)$/);
  const coord = parseInt(coordStr, 10);

  const grid = new Set();

  for (const dot of dots.split("\n")) {
    let [x, y] = dot.split(",").map((n) => parseInt(n, 10));

    if (axis === "x" && x > coord) {
      x -= (x - coord) * 2;
    } else if (axis === "y" && y > coord) {
      y -= (y - coord) * 2;
    }

    grid.add(`${x},${y}`);
  }

  return grid.size;
}

function imageGrid(grid, maxX, maxY) {
  const canvas = require("canvas").createCanvas(maxX, maxY);
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(maxX, maxY);
  for (let y = 0; y <= maxY; y++) {
    for (let x = 0; x <= maxX; x++) {
      const idx = (x + y * maxX) * 4;
      const pixel = grid.has(`${x},${y}`) ? 255 : 0;
      image.data[idx] = pixel;
      image.data[idx + 1] = pixel;
      image.data[idx + 2] = pixel;
      image.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  canvas.createPNGStream().pipe(require("fs").createWriteStream("image.png"));
}

function foldCompletely(input) {
  const [dots, folds] = input.split("\n\n");

  let grid = new Set(dots.split("\n"));

  for (const fold of folds.split("\n")) {
    const [_, axis, coordStr] = fold.match(/^fold along (x|y)=(\d+)$/);
    const coord = parseInt(coordStr, 10);
    const nextGrid = new Set();

    for (const dot of grid.values()) {
      let [x, y] = dot.split(",").map((n) => parseInt(n, 10));

      if (axis === "x" && x > coord) {
        x -= (x - coord) * 2;
      } else if (axis === "y" && y > coord) {
        y -= (y - coord) * 2;
      }

      nextGrid.add(`${x},${y}`);
    }

    grid = nextGrid;
  }

  const maxX = Math.max(
    ...dots.split("\n").map((dot) => parseInt(dot.split(",")[0], 10))
  );
  const maxY = Math.max(
    ...dots.split("\n").map((dot) => parseInt(dot.split(",")[1], 10))
  );
  imageGrid(grid, maxX, maxY);
}

const input = require("fs").readFileSync("inputs/d13.txt", "utf-8");

console.log(foldOnce(input));
foldCompletely(input);
