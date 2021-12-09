function imageGrid(hits, maxX, maxY) {
  const brightest = Math.max(...Object.values(hits).filter((n) => n > 2));
  const canvas = require("canvas").createCanvas(maxX, maxY);
  const ctx = canvas.getContext("2d");
  const image = ctx.createImageData(maxX, maxY);
  for (let y = 0; y < maxY; y++) {
    for (let x = 0; x < maxX; x++) {
      const idx = (x + y * maxX) * 4;
      const val = hits[`${x}:${y}`] || 0;
      const pixel = Math.floor((val * 255) / brightest);
      // if(val !== 0) console.log(pixel);
      image.data[idx] = pixel;
      image.data[idx + 1] = pixel;
      image.data[idx + 2] = pixel;
      image.data[idx + 3] = 255;
    }
  }

  ctx.putImageData(image, 0, 0);
  canvas.createPNGStream().pipe(require("fs").createWriteStream("image.png"));
}

function countOverlappingVents(inputs) {
  const hits = {};
  let maxX = 0,
    maxY = 0;
  for (const input of inputs) {
    const [from, to] = input.split(" -> ");
    const [fx, fy] = from.split(",").map((n) => parseInt(n, 10));
    const [tx, ty] = to.split(",").map((n) => parseInt(n, 10));

    maxX = Math.max(maxX, fx, tx);
    maxY = Math.max(maxY, fy, ty);

    if (fx === tx) {
      const length = Math.abs(fy - ty);
      if (length < 10) process.stdout.write(length.toString() + "y ");
      for (let i = Math.min(fy, ty); i <= Math.max(fy, ty); i++) {
        const idx = `${fx}:${i}`;
        hits[idx] = hits[idx] || 0;
        hits[idx] += 1;
      }
    } else if (fy === ty) {
      const length = Math.abs(fx - tx);
      if (length < 10) process.stdout.write(length.toString() + "x ");
      for (let i = Math.min(fx, tx); i <= Math.max(fx, tx); i++) {
        const idx = `${i}:${fy}`;
        hits[idx] = hits[idx] || 0;
        hits[idx] += 1;
      }
    }
  }

  return Object.values(hits).filter((h) => h > 1).length;
}

function countDiagonalVents(inputs) {
  const hits = {};
  let maxX = 0,
    maxY = 0;
  for (const input of inputs) {
    const [from, to] = input.split(" -> ");
    const [fx, fy] = from.split(",").map((n) => parseInt(n, 10));
    const [tx, ty] = to.split(",").map((n) => parseInt(n, 10));

    maxX = Math.max(maxX, fx, tx);
    maxY = Math.max(maxY, fy, ty);

    if (fx === tx) {
      for (let i = Math.min(fy, ty); i <= Math.max(fy, ty); i++) {
        const idx = `${fx}:${i}`;
        hits[idx] = hits[idx] || 0;
        hits[idx] += 1;
      }
    } else if (fy === ty) {
      for (let i = Math.min(fx, tx); i <= Math.max(fx, tx); i++) {
        const idx = `${i}:${fy}`;
        hits[idx] = hits[idx] || 0;
        hits[idx] += 1;
      }
    } else {
      const [minX, maxX] = [fx, tx].sort();
      const [minY, maxY] = [fy, ty].sort();
      if (Math.abs(fx - tx) !== Math.abs(fy - ty)) {
        throw new Error("non-diagonal!");
      }
      const diffX = tx > fx ? 1 : -1;
      const diffY = ty > fy ? 1 : -1;
      for (let i = 0; i <= Math.abs(fx - tx); i++) {
        const idx = `${fx + i * diffX}:${fy + i * diffY}`;
        hits[idx] = hits[idx] || 0;
        hits[idx] += 1;
      }
    }
  }

  imageGrid(hits, maxX, maxY);
  return Object.values(hits).filter((h) => h > 1).length;
}

const inputs = require("fs").readFileSync("inputs/d5.txt", "utf-8").split("\n");

console.log(countOverlappingVents(inputs));
console.log(countDiagonalVents(inputs));
