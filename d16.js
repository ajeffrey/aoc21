const assert = require("assert");

const T_SUM = 0;
const T_PRODUCT = 1;
const T_MINIMUM = 2;
const T_MAXIMUM = 3;
const T_LITERAL = 4;
const T_GREATER = 5;
const T_LESSER = 6;
const T_EQUAL = 7;

function debug(...args) {
  if (process.env.DEBUG) {
    console.log(...args);
  }
}

function parsePacket(nibbles, index = 0) {
  debug("starting new packet at offset " + index);
  const bits = (len) => {
    let num = 0;
    while (len--) {
      const bit = !!(nibbles[Math.floor(index / 4)] & (1 << (3 - (index % 4))));
      num = (num << 1) | bit;
      index += 1;
    }

    return num;
  };

  const p = {};
  p.version = bits(3);
  p.type = bits(3);
  debug(`v = ${p.version}, t = ${p.type}`);

  if (p.type === T_LITERAL) {
    debug("p is literal");
    p.value = 0n;
    let last = false,
      val = 0,
      nibble = 0;
    while (!last) {
      p.value <<= 4n;
      nibble = bits(5);
      last = !(nibble & 0b10000);
      val = nibble & 0b1111;
      p.value |= BigInt(val);
      debug(`added value nibble ${val}, last = ${last}`);
    }

    if (p.value < 0) {
      console.log("literal < 0!", p.value);
      process.exit(-1);
    }
  } else {
    debug("p is operator");
    p.children = [];
    const lt = bits(1);
    let child;
    if (lt) {
      const l = bits(11);
      debug(`lt = ${lt}, l = ${l}`);
      for (let i = 0; i < l; i++) {
        [child, index] = parsePacket(nibbles, index);
        p.children.push(child);
        debug(`adding child ${i} / ${l}`);
      }
    } else {
      const l = bits(15);
      debug(`lt = ${lt}, l = ${l}`);
      const goal = index + l;
      debug(`goal index = ${goal} (${index} + ${l})`);
      while (index < goal) {
        debug(`${index} < ${goal}`);
        [child, index] = parsePacket(nibbles, index);
        p.children.push(child);
        debug(`added child`);
      }
    }
  }

  return [p, index];
}

function parseBinary(bits) {
  const nibbles = [];
  let nibble = 0;
  for (let i = 0; i < bits.length; i++) {
    nibble |= parseInt(bits[i], 2);

    if (i % 4 === 3) {
      nibbles.push(nibble);
      nibble = 0;
    } else {
      nibble <<= 1;
    }
  }

  return nibbles;
}

function parseHex(nibbles) {
  return nibbles.split("").map((c) => parseInt(c, 16));
}

function formatPacket(packet) {
  if (packet.type === T_LITERAL) {
    return `V${packet.version}L${packet.value}`;
  } else {
    return `V${packet.version}O${packet.children.map(formatPacket).join("")}`;
  }
}

function sumVersions(packet) {
  if (packet.type === T_LITERAL) {
    return packet.version;
  } else {
    return (
      packet.version + packet.children.map(sumVersions).reduce((a, b) => a + b)
    );
  }
}

function executePacket(packet) {
  if (packet.type === T_LITERAL) {
    return packet.value;
  }

  const c = packet.children.map(executePacket);
  switch (packet.type) {
    case T_SUM:
      return c.reduce((a, b) => a + b);
    case T_PRODUCT:
      return c.reduce((a, b) => a * b);
    case T_MINIMUM:
      return c.reduce((a, b) => (a < b ? a : b));
    case T_MAXIMUM:
      return c.reduce((a, b) => (a > b ? a : b));
    case T_GREATER:
      return c[0] > c[1] ? 1n : 0n;
    case T_LESSER:
      return c[0] < c[1] ? 1n : 0n;
    case T_EQUAL:
      return c[0] === c[1] ? 1n : 0n;
  }
}

// check parsers
const numbers = "0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15";
assert(
  parseBinary(
    "0000000100100011010001010110011110001001101010111100110111101111"
  ).join(",") === numbers
);
assert(parseHex("0123456789ABCDEF").join(",") === numbers);

function testRead(bin, expected) {
  // JS needs functional composition.
  const actual = formatPacket(parsePacket(parseBinary(bin))[0]);
  assert(
    actual === expected,
    `expected ${expected}, got ${actual.substr(0, 20)}`
  );
}

function testEval(hex, expected) {
  const actual = executePacket(parsePacket(parseHex(hex))[0]);
  assert(actual === expected, `expected ${expected}, got ${actual}`);
}

testRead("110100101111111000101000", "V6L2021");
testRead(
  "00111000000000000110111101000101001010010001001000000000",
  "V1OV6L10V2L20"
);
testRead(
  "11101110000000001101010000001100100000100011000001100000",
  "V7OV2L1V4L2V1L3"
);
testEval("C200B40A82", 3n);
testEval("04005AC33890", 54n);
testEval("880086C3E88112", 7n);
testEval("CE00C43D881120", 9n);
testEval("D8005AC2A8F0", 1n);
testEval("F600BC2D8F", 0n);
testEval("9C005AC2F8F0", 0n);
testEval("9C0141080250320F1802104A08", 1n);

const input = parseHex(require("fs").readFileSync("inputs/d16.txt", "utf-8"));
console.log(sumVersions(parsePacket(input)[0]));
console.log(executePacket(parsePacket(input)[0]));

// console.log(require('util').inspect(parsePacket(input)[0], true, null));
