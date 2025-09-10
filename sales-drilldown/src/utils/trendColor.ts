export function trendColor(values: number[]) {
  return (p: { dataIndex: number }) => {
    const i = p.dataIndex;
    if (i <= 0) return "#000";
    return values[i] >= values[i - 1] ? "#000" : "#f00";
  };
}
