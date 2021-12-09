const XRANGE = [0, 1, 2, 3, 4];
const YRANGE = [0, 5, 10, 15, 20];

function getScore(board, pick) {
  const total = board
    .filter((n) => n !== "x")
    .reduce((a, b) => a + parseInt(b, 10), 0);

  return total * parseInt(pick, 10);
}

function printBoard(board) {
  const printable = board.map((n) => (n.length == 1 ? ` ${n}` : n));
  for (let i = 0; i < 5; i++) {
    console.log(printable.slice(i * 5, i * 5 + 5).join(" "));
  }
  console.log(board.length + "\n", board);
}

function playBingo(input) {
  const [picksStr, ...boardStrs] = input.split("\n\n");

  const boards = boardStrs.map((bs) => bs.split(/\s+/g).filter((n) => n));
  const picks = picksStr.split(",");

  for (const pick of picks) {
    for (let n = 0; n < boards.length; n++) {
      const board = boards[n].map((n) => (n === pick ? "x" : n));
      boards[n] = board;
      for (let i = 0; i < 5; i++) {
        if (
          XRANGE.every((r) => board[r + i * 5] === "x") ||
          YRANGE.every((r) => board[r + i] === "x")
        ) {
          return getScore(board, pick);
        }
      }
    }
  }
}

function loseBingo(input) {
  const [picksStr, ...boardStrs] = input.split("\n\n");

  let boards = boardStrs.map((bs) => bs.split(/\s+/g).filter((n) => n));
  const picks = picksStr.split(",");

  for (const pick of picks) {
    const drop = [];
    for (let n = 0; n < boards.length; n++) {
      const board = boards[n].map((n) => (n === pick ? "x" : n));
      boards[n] = board;
      for (let i = 0; i < 5; i++) {
        if (
          XRANGE.every((r) => board[r + i * 5] === "x") ||
          YRANGE.every((r) => board[r + i] === "x")
        ) {
          drop.push(n);
          if (drop.length === boards.length) {
            return getScore(boards[0], pick);
          }
        }
      }
    }

    boards = boards.filter((b, i) => !drop.includes(i));
  }
}

const input = require("fs").readFileSync("inputs/d4.txt", "utf-8");

console.log(playBingo(input));
console.log(loseBingo(input));
