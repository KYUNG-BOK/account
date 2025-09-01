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
