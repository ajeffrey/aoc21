const debug = require('debug')('aoc');

function isBetween(val, min, max) {
  return val >= min && val <= max;
}

  function lowestNeighbour(map, [x, y]) { 
    const row = map[y];
    const neighbours = [
      [x, y - 1],
      [x + 1, y],
      [x, y + 1],
      [x - 1, y]
    ].filter(([nx, ny]) => {
      return isBetween(nx, 0, row.length - 1) && isBetween(ny, 0, map.length - 1);
    });

    return neighbours.reduce(([ax, ay], [bx, by]) => map[ay][ax] < map[by][bx] ? [ax, ay] : [bx, by], [x, y]);
  }

function computeLows(map) {
  const lows = new Set();

  for(let y = 0; y < map.length; y++) {
    const row = map[y];
    for(let x = 0; x < row.length; x++) {
      let coords = [x, y];
      let prevCoords;
      debug('' + x + ',' + y + ':');
      do {
        prevCoords = coords;
        coords = lowestNeighbour(map, coords);
        debug(prevCoords.join(',') + ' -> ' + coords.join(','));
      } while(coords[0] !== prevCoords[0] || coords[1] !== prevCoords[1]);

      lows.add(coords.join(','));
    }
  }

  return new Array(...lows).map(val => {
    debug(val);
    const [x, y] = val.split(',').map(n => parseInt(n, 10));
    return map[y][x] + 1;
  }).reduce((a, b) => a + b);
}

function computeBasins(map) {
  const basins = {};

  for(let y = 0; y < map.length; y++) {
    const row = map[y];
    for(let x = 0; x < row.length; x++) {
      let coords = [x, y];
      let prevCoords = [];
      do {
        prevCoords.unshift(coords);
        coords = lowestNeighbour(map, coords);
        debug(prevCoords.join(',') + ' -> ' + coords.join(','));
      } while(coords[0] !== prevCoords[0][0] || coords[1] !== prevCoords[0][1]);

      const basin = basins[coords.join(',')] = basins[coords.join(',')] || new Set();
      for(const coord of prevCoords) {
        const [x, y] = coord;
        if(map[y][x] !== 9) {
          basin.add(coord.join(','));
        }
      }
    }
  }

  debug(basins);

  const topBasins = Object.values(basins).map(basin => basin.size).sort((a, b) => a - b).slice(-3);
  return topBasins.reduce((a, b) => a * b);
}

const map = require('fs').readFileSync('inputs/d9.txt', 'utf-8').split('\n').map(r => r.split('').map(n => parseInt(n, 10)));

console.log(computeLows(map));
console.log(computeBasins(map));