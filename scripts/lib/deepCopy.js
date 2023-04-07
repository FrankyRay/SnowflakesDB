export function deepCopy(src) {
  if (src === null || typeof src !== "object") {
    return src;
  }
  if (Array.isArray(src)) {
    const ret = new Array(src.length);
    let i = ret.length;
    while (i--) {
      ret[i] = deepCopy(src[i]);
    }
    return ret;
  }
  const dest = {};
  for (const key in src) {
    dest[key] = deepCopy(src[key]);
  }
  return dest;
}

export default deepCopy;
