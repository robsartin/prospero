import { sum, mean, peak, minAvgMax, meanPeak } from "./reducers";

describe("daily reducers", () => {
  it("sum totals the day's values in one column", () => {
    expect(sum.suffixes).toEqual([""]);
    expect(sum.apply([0.2, 0.3, 0.5])).toEqual([1]);
  });

  it("mean averages the values", () => {
    expect(mean.suffixes).toEqual([""]);
    expect(mean.apply([2, 4])).toEqual([3]);
  });

  it("peak returns the maximum", () => {
    expect(peak.suffixes).toEqual([""]);
    expect(peak.apply([1, 9, 4])).toEqual([9]);
  });

  it("minAvgMax returns three columns", () => {
    expect(minAvgMax.suffixes).toEqual(["_min", "_avg", "_max"]);
    expect(minAvgMax.apply([2, 4, 6])).toEqual([2, 4, 6]);
  });

  it("meanPeak returns avg then peak", () => {
    expect(meanPeak.suffixes).toEqual(["_avg", "_peak"]);
    expect(meanPeak.apply([2, 4, 6])).toEqual([4, 6]);
  });
});
