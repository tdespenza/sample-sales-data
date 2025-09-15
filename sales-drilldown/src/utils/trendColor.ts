const UP_COLOR = "#000";
const DOWN_COLOR = "#c21";

/**
 * Build ECharts-friendly data items that color each line segment based on the
 * movement from the previous point. Segments with a non-negative change use
 * {@link UP_COLOR}, while negative deltas use {@link DOWN_COLOR}.
 */
export function trendColor(values: number[]) {
  return values.map((value, index) => {
    const color = getSegmentColor(values, index);
    return {
      value,
      lineStyle: { color },
      itemStyle: { color }
    };
  });
}

function getSegmentColor(values: number[], index: number) {
  if (index === 0) {
    const next = values[1];
    if (typeof next === "number" && next < values[0]) return DOWN_COLOR;
    return UP_COLOR;
  }
  const prev = values[index - 1];
  return values[index] < prev ? DOWN_COLOR : UP_COLOR;
}
