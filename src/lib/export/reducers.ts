export interface DailyReducer {
  suffixes: string[];
  apply: (values: number[]) => number[];
}

const total = (v: number[]): number => v.reduce((a, b) => a + b, 0);
const avg = (v: number[]): number => total(v) / v.length;

export const sum: DailyReducer = { suffixes: [""], apply: (v) => [total(v)] };
export const mean: DailyReducer = { suffixes: [""], apply: (v) => [avg(v)] };
export const peak: DailyReducer = { suffixes: [""], apply: (v) => [Math.max(...v)] };

export const minAvgMax: DailyReducer = {
  suffixes: ["_min", "_avg", "_max"],
  apply: (v) => [Math.min(...v), avg(v), Math.max(...v)],
};

export const meanPeak: DailyReducer = {
  suffixes: ["_avg", "_peak"],
  apply: (v) => [avg(v), Math.max(...v)],
};
