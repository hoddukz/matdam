// Tag: util
// Path: /Users/hodduk/Documents/git/mat_dam/packages/utils/src/unit-conversion.ts

// Metric <-> Imperial 단위 변환 유틸리티
// 기획서 섹션 3.2 기반

const ML_PER_TSP = 5;
const ML_PER_TBSP = 15;
const ML_PER_CUP = 240;
const ML_PER_FL_OZ = 29.5735;
const G_PER_OZ = 28.3495;
const G_PER_LB = 453.592;

type ConversionMap = Record<string, Record<string, number>>;

const volumeToMl: Record<string, number> = {
  tsp: ML_PER_TSP,
  tbsp: ML_PER_TBSP,
  cup: ML_PER_CUP,
  fl_oz: ML_PER_FL_OZ,
  ml: 1,
  l: 1000,
};

const weightToG: Record<string, number> = {
  g: 1,
  kg: 1000,
  oz: G_PER_OZ,
  lb: G_PER_LB,
};

export function convertVolume(
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromMl = volumeToMl[fromUnit];
  const toMl = volumeToMl[toUnit];
  if (fromMl == null || toMl == null) return null;
  return (value * fromMl) / toMl;
}

export function convertWeight(
  value: number,
  fromUnit: string,
  toUnit: string
): number | null {
  const fromG = weightToG[fromUnit];
  const toG = weightToG[toUnit];
  if (fromG == null || toG == null) return null;
  return (value * fromG) / toG;
}
