export function trendColor(values: number[]) {
  return values.map((v, i) => ({
    value: v,
    lineStyle: {
      color: i < values.length - 1 && values[i + 1] < v ? "#f00" : "#000"
    }
  }));
}
