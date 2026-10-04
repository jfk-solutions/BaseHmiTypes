/** Match the C# renderer's invariant double formatting, including exact nearest-even ties. */
export function formatScaleLabel(value: number, places: number, exponential: boolean): string {
  if (!Number.isFinite(value)) return String(value);
  const negative = value < 0 || Object.is(value, -0);
  const bits = new DataView(new ArrayBuffer(8));
  bits.setFloat64(0, Math.abs(value), false);
  const raw = bits.getBigUint64(0, false), binaryExponent = Number((raw >> 52n) & 0x7ffn);
  let numerator = raw & ((1n << 52n) - 1n), denominator = 1n;
  if (binaryExponent !== 0) numerator += 1n << 52n;
  const power = binaryExponent === 0 ? -1074 : binaryExponent - 1023 - 52;
  if (power >= 0) numerator <<= BigInt(power); else denominator <<= BigInt(-power);
  const ten = (exponent: number): bigint => 10n ** BigInt(exponent);
  const comparePower = (exponent: number): number => {
    const left = exponent >= 0 ? numerator : numerator * ten(-exponent);
    const right = exponent >= 0 ? denominator * ten(exponent) : denominator;
    return left < right ? -1 : left > right ? 1 : 0;
  };
  let exponent = exponential && numerator !== 0n ? Math.floor(Math.log10(Math.abs(value))) : 0;
  if (exponential && numerator !== 0n) {
    // Correct logarithm rounding at powers of ten using the exact binary fraction.
    while (comparePower(exponent) < 0) exponent--;
    while (comparePower(exponent + 1) >= 0) exponent++;
  }
  const decimalPower = places - (exponential ? exponent : 0);
  const scaledNumerator = decimalPower >= 0 ? numerator * ten(decimalPower) : numerator;
  const scaledDenominator = decimalPower >= 0 ? denominator : denominator * ten(-decimalPower);
  let rounded = scaledNumerator / scaledDenominator;
  const twiceRemainder = (scaledNumerator % scaledDenominator) * 2n;
  if (twiceRemainder > scaledDenominator || twiceRemainder === scaledDenominator && (rounded & 1n) !== 0n) rounded++;
  if (exponential && rounded >= ten(places + 1)) { rounded /= 10n; exponent++; }
  const digits = rounded.toString().padStart(places + 1, "0");
  const text = places === 0 ? digits : `${digits.slice(0, -places)}.${digits.slice(-places)}`;
  return `${negative ? "-" : ""}${text}${exponential ? `e${exponent < 0 ? "-" : "+"}${String(Math.abs(exponent)).padStart(3, "0")}` : ""}`;
}
