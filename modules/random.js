const { webcrypto } = require('crypto');

/**
 * This class is not multi-thread safe
 */
class Random {
  constructor() {
    /** 暗号学的に強力なランダム値を読み込むためのバッファ。排他制御をしていないので多分バグる。 */
    this.arrayBuffer = new Int32Array(1);
  }

  // https://github.com/openjdk/jdk/blob/739769c8fc4b496f08a92225a12d07414537b6c0/src/java.base/share/classes/java/util/Random.java#L324
  nextInt(bound) {
    if (arguments.length < 1) {
      // crypto.getRandomValues() は node v17.4.0 から使用可能
      // crypto.webcrypto.getRandomValues() は node v15.0.0 から使用可能
      return webcrypto.getRandomValues(this.arrayBuffer)[0];
    }
    if (bound <= 0) {
      throw new Error('bound must be positive');
    }

    /* eslint no-bitwise: ["error", {"allow":[">>>", ">>", "&", "<<"]}] */
    let r = webcrypto.getRandomValues(this.arrayBuffer)[0] >>> 1;
    const m = bound - 1;
    if ((bound & m) === 0) {
      r = Number(BigInt.asIntN(32, (BigInt(bound) * BigInt(r)) >> 31n));
    } else {
      /* eslint no-cond-assign: "error" */
      for (let u = r; u - (r = u % bound) + m < 0;
        u = (webcrypto.getRandomValues(this.arrayBuffer)[0] >>> 1));
    }
    return r;
  }

  // https://github.com/openjdk/jdk/blob/739769c8fc4b496f08a92225a12d07414537b6c0/src/java.base/share/classes/java/util/Random.java#L425
  nextFloat() {
    return (webcrypto.getRandomValues(this.arrayBuffer)[0] >>> 8) / (1 << 24);
  }
}

// https://github.com/openjdk/jdk/blob/739769c8fc4b496f08a92225a12d07414537b6c0/src/java.base/share/classes/java/util/Random.java#L324
// https://hacknote.jp/archives/31788/
// https://web.archive.org/web/20210504071450/https://hacknote.jp/archives/31788/
function nextInt(bound) {
  if (arguments.length < 1) {
    // crypto.getRandomValues() は node v17.4.0 から使用可能
    // crypto.webcrypto.getRandomValues() は node v15.0.0 から使用可能
    return webcrypto.getRandomValues(new Int32Array(1))[0];
  }
  if (bound <= 0) {
    throw new Error('bound must be positive');
  }

  // FIXME: 呼び出されるたびにarrayが生成されるのはもったいなくない？=>乱数がArray経由でしか取得できないからなんとも……
  const array = new Int32Array(1);
  webcrypto.getRandomValues(array);
  let r = array[0] >>> 1;
  const m = bound - 1;
  if ((bound & m) === 0) {
    r = Number(BigInt.asIntN(32, (BigInt(bound) * BigInt(r)) >> 31n));
  } else {
    for (let u = r; u - (r = u % bound) + m < 0; u = (webcrypto.getRandomValues(array)[0] >>> 1));
  }
  return r;
}

// https://github.com/openjdk/jdk/blob/739769c8fc4b496f08a92225a12d07414537b6c0/src/java.base/share/classes/java/util/Random.java#L425
function nextFloat() {
  // FIXME: これ呼び出されるたびにreduceが回るのは絶対重いと思うけどなぁ……
  // return webcrypto.getRandomValues(new Uint8Array(3))
  // .reduce((previos, current, i, a) => (previos << 8) | current, 0) / (1 << 24);
  // reduceで回さないほうが早い
  return (webcrypto.getRandomValues(new Int32Array(1))[0] >>> 8) / (1 << 24);
}

/*
const DOUBLE_UNIT = 1.0 / (1 << 53);

// https://github.com/openjdk/jdk/blob/739769c8fc4b496f08a92225a12d07414537b6c0/src/java.base/share/classes/java/util/Random.java#L466
// JavaScript では安全に 64bit 整数を Number に変換できないため nextDouble を実装することが不可能
// double に変換してからシフトして加算するか？=>まずDOUBLE_UNITをNumberで表現できないので不可
function nextDouble() {
  let buffer = getRandomValues(new Int32Array(2));
  return Number(BigInt.asIntN(64, (BigInt(buffer[0] >>> 6) << 27n)
  + BigInt(buffer[1] >>> 5))) * DOUBLE_UNIT;
}
 */

module.exports.nextInt = nextInt;
module.exports.nextFloat = nextFloat;
module.exports.Random = Random;
