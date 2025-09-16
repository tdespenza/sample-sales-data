import type { CallbackDataParams, ZRColor } from "echarts/types/dist/shared";
import type { LineSeriesOption } from "echarts/charts";

const UP_COLOR = "#000";
const DOWN_COLOR = "#c21";

type LineColorGetter = (params: CallbackDataParams) => ZRColor;

type TrendSeriesConfig = {
  data: LineSeriesOption["data"];
  lineStyle: { color: LineColorGetter };
  itemStyle: NonNullable<LineSeriesOption["itemStyle"]>;
  emphasis: {
    lineStyle: { color: LineColorGetter };
    itemStyle: NonNullable<LineSeriesOption["itemStyle"]>;
  };
};

/**
 * Build the reusable series configuration that colors each line segment based on
 * how the value changed from the previous point. Segments with a non-negative
 * change use {@link UP_COLOR}, while negative deltas use {@link DOWN_COLOR}.
 */
export function trendColor(values: number[]): TrendSeriesConfig {
  const safeValues = values.slice();

  const colorForParams: LineColorGetter = (params) => {
    const index = typeof params.dataIndex === "number" ? params.dataIndex : 0;
    return getSegmentColor(safeValues, clampIndex(index, safeValues.length));
  };

  return {
    data: safeValues,
    lineStyle: { color: colorForParams },
    itemStyle: { color: colorForParams },
    emphasis: {
      lineStyle: { color: colorForParams },
      itemStyle: { color: colorForParams }
    }
  };
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

function clampIndex(index: number, length: number) {
  if (index < 0) return 0;
  if (index >= length) return length - 1;
  return index;
}
