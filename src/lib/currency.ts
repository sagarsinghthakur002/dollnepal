export function formatNPR(amount: number): string {
  return `NPR ${Number(amount).toLocaleString("en-IN")}`;
}
