function computePower(bins) {
  const mc = bins[0].split("").map((_) => 0);
  for (const bin of bins) {
    for (let i = 0; i < bin.length; i++) {
      mc[i] += bin[i] === "1" ? 1 : -1;
    }
  }

  console.log(mc);
  const gamma = parseInt(mc.map((n) => (n > 0 ? "1" : "0")).join(""), 2);
  const epsilon = parseInt(mc.map((n) => (n > 0 ? "0" : "1")).join(""), 2);
  return gamma * epsilon;
}

function computeLifeSupport(bins) {
  let oxbins = bins.slice();
  let cobins = bins.slice();
  for (let i = 0; i < bins[0].length; i++) {
    if (oxbins.length > 1) {
      const mcd =
        oxbins.filter((bin) => bin[i] === "1").length >= oxbins.length / 2
          ? "1"
          : "0";
      oxbins = oxbins.filter((bin) => bin[i] === mcd);
    }
    if (cobins.length > 1) {
      const lcd =
        cobins.filter((bin) => bin[i] === "1").length >= cobins.length / 2
          ? "0"
          : "1";
      cobins = cobins.filter((bin) => bin[i] === lcd);
    }
  }
  const oxbin = parseInt(oxbins[0], 2);
  const cobin = parseInt(cobins[0], 2);
  console.log(oxbin, cobin);
  return oxbin * cobin;
}

const bins = require("fs").readFileSync("inputs/d3.txt", "utf-8").split("\n");

console.log(computePower(bins));
console.log(computeLifeSupport(bins));
