import type { Transaction } from "../types/budget";
import { formatKRW } from "../lib/format";

type Props = {
  date: string;
  items: Transaction[];
};

export default function DayHeader({ date, items }: Props) {
  const income = items
    .filter((i) => i.type === "income")
    .reduce((s, i) => s + i.amount, 0);
  const expense = items
    .filter((i) => i.type === "expense")
    .reduce((s, i) => s + i.amount, 0);

  return (
    <div className="flex items-center justify-between px-1">
      <div className="text-sm text-slate-500">{date}</div>
      <div className="flex items-center gap-2 text-xs">
        <span className="rounded-full bg-green-100 text-green-700 px-2 py-0.5">
          {`+${formatKRW(income)}`}
        </span>
        <span className="rounded-full bg-rose-100 text-rose-700 px-2 py-0.5">
          {`-${formatKRW(expense)}`}
        </span>
        <span className="rounded-full border border-slate-300 px-2 py-0.5 text-slate-700">
          {formatKRW(income - expense)}
        </span>
      </div>
    </div>
  );
}
