export function trendColor(values: number[]) {
  return (p: { dataIndex: number }) => {
    const i = p.dataIndex;
    if (i >= values.length - 1) return "#000";
    return values[i + 1] >= values[i] ? "#000" : "#f00";
  };
}
