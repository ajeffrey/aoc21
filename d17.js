function highestShot(target) {
  const hits = [];
  let count = 0;
  const MIN_Y = -100,
    MAX_Y = 1000,
    MIN_X = -100,
    MAX_X = 1000;
  const TOTAL = (MAX_Y - MIN_Y + 1) * (MAX_X - MIN_X + 1);
  for (let svy = MIN_Y; svy <= MAX_Y; svy++) {
    for (let svx = MIN_X; svx <= MAX_X; svx++) {
      let vx = svx,
        vy = svy;
      let pos = { x: 0, y: 0 };
      let maxY = 0;
      while (pos.x <= target.x[1] && pos.y >= target.y[0]) {
        pos.x += vx;
        pos.y += vy;
        if (pos.y > maxY) maxY = pos.y;
        if (vx > 0) vx -= 1;
        vy -= 1;
        if (svx == 7 && svy == -1) {
          console.log(pos);
        }
        if (
          pos.x >= target.x[0] &&
          pos.x <= target.x[1] &&
          pos.y >= target.y[0] &&
          pos.y <= target.y[1]
        ) {
          hits.push({ x: svx, y: svy, maxY });
          if (svx == 7 && svy == -1) console.log("hit");
          break;
        }
      }

      count += 1;
      if (count % 1000 === 0) {
        process.stdout.write(
          "\x1B8" + ((count / TOTAL) * 100).toFixed(2) + "%"
        );
      }
    }
  }
  process.stdout.write("\n\n");
  return hits;
}

const target = { x: [244, 303], y: [-91, -54] };

const hits = highestShot(target);
console.log(hits.sort((a, b) => b.maxY - a.maxY)[0].maxY);
console.log(hits.length);
