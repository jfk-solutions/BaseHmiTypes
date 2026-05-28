export interface HmiColor {
  alpha: number;
  red: number;
  green: number;
  blue: number;
}

export function hmiColorFromArgb(alpha: number, red: number, green: number, blue: number): HmiColor {
  return { alpha, red, green, blue };
}
