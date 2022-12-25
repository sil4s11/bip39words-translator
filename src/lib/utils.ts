const VERSION = "shamir39-p1";
const defaults = {
  bits: 8, // default number of bits
  radix: 16, // work with HEX by default
  minBits: 3,
  maxBits: 20, // this permits 1,048,575 shares, though going this high is NOT recommended in JS!

  bytesPerChar: 2,
  maxBytesPerChar: 6, // Math.pow(256,7) > Math.pow(2,53)

  // Primitive polynomials (in decimal form) for Galois Fields GF(2^n), for 2 <= n <= 30
  // The index of each term in the array corresponds to the n for that polynomial
  // i.e. to get the polynomial for n=16, use primitivePolynomials[16]
  primitivePolynomials: [
    null,
    null,
    1,
    3,
    3,
    5,
    3,
    3,
    29,
    17,
    9,
    5,
    83,
    27,
    43,
    3,
    45,
    9,
    39,
    39,
    9,
    5,
    3,
    33,
    27,
    9,
    71,
    39,
    9,
    5,
    83,
  ],

  // warning for insecure PRNG
  warning:
    "WARNING:\nA secure random number generator was not found.\nUsing Math.random(), which is NOT cryptographically strong!",
};
const bits = 11;
const size = Math.pow(2, bits || defaults.bits);
const config: any = {
  radix: defaults.radix,
  bits: bits || defaults.bits,
  size: size,
  max: size - 1,
  rng: getRNG(),
};

function isInited() {
  if (
    !config.bits ||
    !config.size ||
    !config.max ||
    !config.logs ||
    !config.exps ||
    config.logs.length !== config.size ||
    config.exps.length !== config.size
  ) {
    return false;
  }
  return true;
}

function init(bits: number) {
  if (
    bits &&
    (typeof bits !== "number" ||
      bits % 1 !== 0 ||
      bits < defaults.minBits ||
      bits > defaults.maxBits)
  ) {
    throw new Error(
      "Number of bits must be an integer between " +
        defaults.minBits +
        " and " +
        defaults.maxBits +
        ", inclusive."
    );
  }

  config.radix = defaults.radix;
  config.bits = bits || defaults.bits;
  config.size = Math.pow(2, config.bits);
  config.max = config.size - 1;

  // Construct the exp and log tables for multiplication.
  const logs = [],
    exps = [],
    primitive = defaults.primitivePolynomials[config.bits] || 1;
  let x = 1;
  for (let i = 0; i < config.size; i++) {
    exps[i] = x;
    logs[x] = i;
    x <<= 1;
    if (x >= config.size) {
      x ^= primitive;
      x &= config.max;
    }
  }

  config.logs = logs;
  config.exps = exps;
}

// function setRNG(rng: any, alert: string) {
//   if (!isInited()) {
//     init();
//   }
//   config.unsafePRNG = false;
//   rng = rng || getRNG();

//   // test the RNG (5 times)
//   if (
//     typeof rng !== "function" ||
//     typeof rng(config.bits) !== "string" ||
//     !parseInt(rng(config.bits), 2) ||
//     rng(config.bits).length > config.bits ||
//     rng(config.bits).length < config.bits
//   ) {
//     throw new Error(
//       "Random number generator is invalid. Supply an RNG of the form function(bits){} that returns a string containing 'bits' number of random 1's and 0's."
//     );
//   } else {
//     config.rng = rng;
//   }
//   config.alert = !!alert;

//   return !!config.unsafePRNG;
// }

function warn() {
  // window["console"]["warn"](defaults.warning);
  // if (typeof window["alert"] === "function" && config.alert) {
  //   window["alert"](defaults.warning);
  // }
  // console.log("aaa");
}

function getRNG() {
  let crypto: any;

  function construct(bits: number, arr: number[], radix: number, size: number) {
    let str = "",
      i = 0;
    const len = arr.length - 1;
    while (i < len || str.length < bits) {
      const strToPad = parseInt(arr[i].toString(), radix).toString(2);
      str += padLeft(strToPad, size);
      i++;
    }
    str = str.substr(-bits);
    if ((str.match(/0/g) || []).length === str.length) {
      // all zeros?
      return null;
    } else {
      return str;
    }
  }

  // node.js crypto.randomBytes()
  // if (
  //   typeof require === "function" &&
  //   (crypto = require("crypto")) &&
  //   (randomBits = crypto["randomBytes"])
  // ) {
  //   return function (bits) {
  //     const bytes = Math.ceil(bits / 8);
  //     let str = null;

  //     while (str === null) {
  //       str = construct(bits, randomBits(bytes).toString("hex"), 16, 4);
  //     }
  //     return str;
  //   };
  // }

  // browsers with window.crypto.getRandomValues()
  if (
    window["crypto"] &&
    typeof window["crypto"]["getRandomValues"] === "function" &&
    typeof window["Uint32Array"] === "function"
  ) {
    crypto = window["crypto"];
    return function (bits = config.bits) {
      const elems = Math.ceil(bits / 32);
      let str = null;
      const arr = new window["Uint32Array"](elems);

      while (str === null) {
        crypto["getRandomValues"](arr);
        str = construct(bits, Array.from(arr), 10, 32);
      }

      return str;
    };
  }

  // A totally insecure RNG!!! (except in Safari)
  // Will produce a warning every time it is called.
  config.unsafePRNG = true;
  warn();

  const bitsPerNum = 32;
  const max = Math.pow(2, bitsPerNum) - 1;
  return function (bits: number) {
    const elems = Math.ceil(bits / bitsPerNum);
    const arr = [];
    let str = null;
    while (str === null) {
      for (let i = 0; i < elems; i++) {
        arr[i] = Math.floor(Math.random() * max + 1);
      }
      str = construct(bits, arr, 10, bitsPerNum);
    }
    return str;
  };
}

function bin2hex(str: string) {
  let hex = "",
    num;
  str = padLeft(str, 4);
  for (let i = str.length; i >= 4; i -= 4) {
    num = parseInt(str.slice(i - 4, i), 2);
    if (isNaN(num)) {
      throw new Error("Invalid binary character.");
    }
    hex = num.toString(16) + hex;
  }
  return hex;
}

function horner(x: number, coeffs: Array<any>) {
  const logx = config.logs[x];
  let fx = 0;
  for (let i = coeffs.length - 1; i >= 0; i--) {
    if (fx === 0) {
      fx = coeffs[i];
      continue;
    }
    fx = config.exps[(logx + config.logs[fx]) % config.max] ^ coeffs[i];
  }
  return fx;
}

function _getShares(secret: number, numShares: number, threshold: number) {
  const shares = [];
  const coeffs = [secret];

  for (let i = 1; i < threshold; i++) {
    coeffs[i] = parseInt(config.rng(config.bits), 2);
  }
  for (let i = 1, len = numShares + 1; i < len; i++) {
    shares[i - 1] = {
      x: i,
      y: horner(i, coeffs),
    };
  }
  return shares;
}

// function isSetRNG() {
//   return typeof config.rng === "function";
// }

function share(
  secret: string,
  numShares: number,
  threshold: number,
  padLength = 0,
  withoutPrefix = true
) {
  if (!isInited()) {
    init(config.bits);
  }
  // if (!isSetRNG()) {
  //   setRNG();
  // }

  padLength = padLength || 0;

  if (typeof secret !== "string") {
    throw new Error("Secret must be a string.");
  }
  if (typeof numShares !== "number" || numShares % 1 !== 0 || numShares < 2) {
    throw new Error(
      "Number of shares must be an integer between 2 and 2^bits-1 (" +
        config.max +
        "), inclusive."
    );
  }
  if (numShares > config.max) {
    const neededBits = Math.ceil(Math.log(numShares + 1) / Math.LN2);
    throw new Error(
      "Number of shares must be an integer between 2 and 2^bits-1 (" +
        config.max +
        "), inclusive. To create " +
        numShares +
        " shares, use at least " +
        neededBits +
        " bits."
    );
  }
  if (typeof threshold !== "number" || threshold % 1 !== 0 || threshold < 2) {
    throw new Error(
      "Threshold number of shares must be an integer between 2 and 2^bits-1 (" +
        config.max +
        "), inclusive."
    );
  }
  if (threshold > config.max) {
    const neededBits = Math.ceil(Math.log(threshold + 1) / Math.LN2);
    throw new Error(
      "Threshold number of shares must be an integer between 2 and 2^bits-1 (" +
        config.max +
        "), inclusive.  To use a threshold of " +
        threshold +
        ", use at least " +
        neededBits +
        " bits."
    );
  }
  if (typeof padLength !== "number" || padLength % 1 !== 0) {
    throw new Error("Zero-pad length must be an integer greater than 1.");
  }

  if (config.unsafePRNG) {
    warn();
  }

  function split(str: string, padLength: number) {
    if (padLength) {
      str = padLeft(str, padLength);
    }
    const parts = [];
    for (let i = str.length; i > config.bits; i -= config.bits) {
      parts.push(parseInt(str.slice(i - config.bits, i), 2));
    }
    //TODO check
    parts.push(parseInt(str.slice(0, 1), 2));
    return parts;
  }

  secret = "1" + hex2bin(secret); // append a 1 so that we can preserve the correct number of leading zeros in our secret
  const newSecret = split(secret, padLength);
  const x = new Array(numShares),
    y = new Array(numShares);
  for (let i = 0, len = newSecret.length; i < len; i++) {
    const subShares = _getShares(newSecret[i], numShares, threshold);
    for (let j = 0; j < numShares; j++) {
      x[j] = x[j] || subShares[j].x.toString(config.radix);
      y[j] = padLeft(subShares[j].y.toString(2)) + (y[j] ? y[j] : "");
    }
  }
  const padding = config.max.toString(config.radix).length;
  if (withoutPrefix) {
    for (let i = 0; i < numShares; i++) {
      x[i] = bin2hex(y[i]);
    }
  } else {
    for (let i = 0; i < numShares; i++) {
      x[i] =
        config.bits.toString(36).toUpperCase() +
        padLeft(x[i], padding) +
        bin2hex(y[i]);
    }
  }

  return x;
}

// encodes the paramaters into a binary string
const paramsToBinaryStr = (m: number, o: number) => {
  // get m as binary, padded to multiple of 5 bits
  let mBin = m.toString(2);
  // get o as binary, padded to multiple of 5 bits
  let oBin = o.toString(2);
  // calculate the overall binary length of each parameter, which must
  // be identical
  const mBinFinalLength = Math.ceil(mBin.length / 5) * 5;
  const oBinFinalLength = Math.ceil(oBin.length / 5) * 5;
  const binFinalLength = Math.max(mBinFinalLength, oBinFinalLength);
  // pad each parameter
  mBin = lpad(mBin, binFinalLength);
  oBin = lpad(oBin, binFinalLength);
  // encode parameters in binary
  const totalWords = oBin.length / 5;
  let binStr = "";
  for (let i = 0; i < totalWords; i++) {
    const isLastWord = i == totalWords - 1;
    let leadingBit = "1";
    if (isLastWord) {
      leadingBit = "0";
    }
    const mBits = mBin.substring(i * 5, (i + 1) * 5);
    const oBits = oBin.substring(i * 5, (i + 1) * 5);
    binStr = binStr + leadingBit + mBits + oBits;
  }
  return binStr;
};

const binToMnemonic = (binStr: string, wordlist: string[] = []) => {
  const mnemonic: any[] = [];
  // pad binary to suit words of 11 bits
  const totalWords = Math.ceil(binStr.length / config.bits);
  const totalBits = totalWords * config.bits;
  binStr = lpad(binStr, totalBits);
  // convert bits to words
  for (let i = 0; i < totalWords; i++) {
    const bits = binStr.substring(i * config.bits, (i + 1) * config.bits);
    const wordIndex = parseInt(bits, 2);
    const word = wordlist[wordIndex];
    mnemonic.push(word);
  }
  return mnemonic;
};

const lpad = (s: string, n: number) => {
  s = s.toString();
  while (s.length < n) {
    s = "0" + s;
  }
  return s;
};

function padLeft(str: string, bits = config.bits) {
  bits = bits || config.bits;
  const missing = str.length % bits;
  return (missing ? new Array(bits - missing + 1).join("0") : "") + str;
}

function hex2bin(str: string) {
  let bin = "",
    num;
  for (let i = str.length - 1; i >= 0; i--) {
    num = parseInt(str[i], 16);
    if (isNaN(num)) {
      throw new Error("Invalid hex character.");
    }
    bin = padLeft(num.toString(2), 4) + bin;
  }
  return bin;
}

export const split = (
  bip39MnemonicWords: string[] = [],
  wordlist: string[] = [],
  m: number,
  n: number
) => {
  // validate inputs
  if (m < 2) {
    return {
      error: "Must require at least 2 shares",
    };
  }
  if (m > 4095) {
    return {
      error: "Must require at most 4095 shares",
    };
  }
  if (n < 2) {
    return {
      error: "Must split to at least 2 shares",
    };
  }
  if (n > 4095) {
    return {
      error: "Must split to at most 4095 shares",
    };
  }
  // TODO make wordlist length more general
  if (wordlist.length !== 2048) {
    return {
      error: "Wordlist must have 2048 words",
    };
  }
  if (bip39MnemonicWords.length == 0) {
    return {
      error: "No bip39 mnemonic words provided",
    };
  }
  // convert bip39 mnemonic into bits
  let binStr = "";
  for (let i = 0; i < bip39MnemonicWords.length; i++) {
    const w = bip39MnemonicWords[i];
    const index = wordlist.indexOf(w);
    if (index == -1) {
      const errorMsg = "Invalid word found in list: " + w;
      return {
        error: errorMsg,
      };
    }
    let bits = index.toString(2);
    bits = lpad(bits, config.bits);
    binStr = binStr + bits;
  }
  // pad mnemonic for use as hex
  const lenForHex = Math.ceil(binStr.length / 4) * 4;
  binStr = lpad(binStr, lenForHex);
  // convert to hex string
  const totalHexChars = binStr.length / 4;
  let hexStr = "";
  for (let i = 0; i < totalHexChars; i++) {
    const nibbleStr = binStr.substring(i * 4, (i + 1) * 4);
    const hexValue = parseInt(nibbleStr, 2);
    const hexChar = hexValue.toString(16);
    hexStr = hexStr + hexChar;
  }
  // create shamir parts
  const partsHex = share(hexStr, n, m, 0, true);
  // convert parts into shamir39 mnemonics
  const mnemonics = [];
  for (let o = 0; o < partsHex.length; o++) {
    // set mnemonic version
    let mnemonic = [VERSION];
    // set mnemonic parameters
    const parametersBin = paramsToBinaryStr(m, o);
    const paramsWords = binToMnemonic(parametersBin, wordlist);
    mnemonic = mnemonic.concat(paramsWords);
    // set mnemonic shamir part
    const partHex = partsHex[o];
    const partBin = hex2bin(partHex);
    const partWords = binToMnemonic(partBin, wordlist);
    mnemonic = mnemonic.concat(partWords);
    // add mnemonic part to mnemonics
    mnemonics.push(mnemonic);
  }
  return {
    mnemonics: mnemonics,
  };
};
