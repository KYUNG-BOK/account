export const formatKRW = (n: number) =>
  new Intl.NumberFormat("ko-KR", {
    style: "currency",
    currency: "KRW",
    maximumFractionDigits: 0,
  }).format(n);

export const ymd = (d = new Date()) =>
  d.toISOString().slice(0, 10); // 'YYYY-MM-DD'

export const ym = (d = new Date()) =>
  d.toISOString().slice(0, 7);  // 'YYYY-MM'

export function ymdToKorean(date: string) {
  const d = new Date(date + "T00:00:00");
  return d.toLocaleDateString("ko-KR", { year: "numeric", month: "long", day: "numeric", weekday: "short" });
}