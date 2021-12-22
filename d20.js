const assert = require("assert");

const neighbours = (ox, oy) =>
  [-1, 0, 1].flatMap((y) => [-1, 0, 1].map((x) => [x + ox, y + oy]));

function getPixel(image, infinite, [x, y]) {
  if (y in image && x in image[y]) {
    return image[y][x];
  }
  return infinite;
}

function newValue(image, hires, infinite, [x, y]) {
  let binary = "";
  for (const n of neighbours(x, y)) {
    binary += getPixel(image, infinite, n) === "#" ? "1" : "0";
  }
  const char = hires.charAt(parseInt(binary, 2));
  return char;
}

function print(image) {
  return image.map((r) => r.join("")).join("\n");
}

function expandImage(input, times) {
  const [hiresStr, imageStr] = input.split("\n\n");
  const hires = hiresStr.replace(/\n/g, "");
  let image = imageStr.split("\n").map((r) => r.split(""));
  let infinite = ".";

  for (let i = 0; i < times; i++) {
    const newImage = [];
    for (let y = -1; y <= image.length; y++) {
      const row = [];
      for (let x = -1; x <= image[0].length; x++) {
        row.push(newValue(image, hires, infinite, [x, y]));
      }

      newImage.push(row);
    }
    image = newImage;
    infinite = hires.charAt(infinite === "." ? 0 : hires.length - 1);
  }
  return image;
}

function countPixels(image) {
  return image.reduce((a, b) => a + b.filter((c) => c === "#").length, 0);
}

const eg = `..#.#..#####.#.#.#.###.##.....###.##.#..###.####..#####..#....#..#..##..##
#..######.###...####..#..#####..##..#.#####...##.#.#..#.##..#.#......#.###
.######.###.####...#.##.##..#..#..#####.....#.#....###..#.##......#.....#.
.#..#..##..#...##.######.####.####.#.#...#.......#..#.#.#...####.##.#.....
.#..#...##.#.##..#...##.#.##..###.#......#.#.......#.#.#.####.###.##...#..
...####.#..#..#.##.#....##..#.####....##...##..#...#......#.#.......#.....
..##..####..#...#.#.#...##..#.#..###..#####........#..####......#..#

#..#.
#....
##..#
..#..
..###`;

const input = require("fs").readFileSync("inputs/d20.txt", "utf-8");

assert(countPixels(expandImage(eg, 2)) === 35);
assert(
  print(expandImage(eg, 1)) ===
    `.##.##.
#..#.#.
##.#..#
####..#
.#..##.
..##..#
...#.#.`
);

assert(
  print(expandImage(eg, 2)) ===
    `.......#.
.#..#.#..
#.#...###
#...##.#.
#.....#.#
.#.#####.
..#.#####
...##.##.
....###..`
);

console.log(countPixels(expandImage(input, 1)));
console.log(countPixels(expandImage(input, 2)));
console.log(countPixels(expandImage(input, 50)));
