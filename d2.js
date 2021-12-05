function computeLocation(commands) {
  let x = 0,
    y = 0;
  for (const command of commands) {
    const [dir, amt] = command.split(" ");
    switch (dir) {
      case "forward":
        x += parseInt(amt);
        break;
      case "down":
        y += parseInt(amt);
        break;
      case "up":
        y -= parseInt(amt);
        break;
    }
  }

  return x * y;
}

function computeLocationWithAim(commands) {
  let x = 0,
    y = 0,
    aim = 0;
  for (const command of commands) {
    const [dir, amt] = command.split(" ");
    switch (dir) {
      case "forward":
        x += parseInt(amt);
        y += aim * parseInt(amt);
        break;
      case "down":
        aim += parseInt(amt);
        break;
      case "up":
        aim -= parseInt(amt);
        break;
    }
  }

  return x * y;
}

const commands = require('fs').readFileSync('inputs/d2.txt', 'utf-8').split("\n");

console.log(computeLocation(commands));
console.log(computeLocationWithAim(commands));
