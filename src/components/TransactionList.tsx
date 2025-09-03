import { AnimatePresence, motion } from "framer-motion";
import { DayHeader } from ".";
import type { Transaction } from "../types/budget";
import { formatKRW } from "../lib/format";

const spring = { type: "spring" as const, stiffness: 300, damping: 22 };

type Props = {
  byDay: [string, Transaction[]][];
  onDetail: (t: Transaction) => void;
  onEdit: (t: Transaction) => void;
  onRemove: (id: string) => void;
};

export default function TransactionList({ byDay, onDetail, onEdit, onRemove }: Props) {
  if (byDay.length === 0) return null;

  return (
    <div className="space-y-6">
      {byDay.map(([date, items]) => (
        <section key={date} className="space-y-2">
          <DayHeader date={date} items={items} />
          <ul className="space-y-2">
            <AnimatePresence initial={false}>
              {items.map((t) => (
                <motion.li
                  key={t.id}
                  layout
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={spring}
                  onClick={() => onDetail(t)}
                  className="rounded-xl bg-white border border-slate-200 shadow-sm"
                >
                  <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">
                        {t.category}{" "}
                        {t.memo ? (
                          <span className="text-slate-500">· {t.memo}</span>
                        ) : null}
                      </div>
                      <div className="text-xs text-slate-500">
                        {t.type === "expense" ? "지출" : "수입"}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={
                          t.type === "expense"
                            ? "text-red-600 font-bold"
                            : "text-green-600 font-bold"
                        }
                      >
                        {t.type === "expense" ? "-" : "+"}
                        {formatKRW(t.amount)}
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          className="h-8 rounded-md px-2 text-xs border border-slate-300 hover:bg-slate-50"
                          onClick={() => onEdit(t)}
                        >
                          수정
                        </button>
                        <button
                          className="h-8 rounded-md px-2 text-xs bg-rose-600 text-white hover:bg-rose-700"
                          onClick={() => onRemove(t.id)}
                        >
                          삭제
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.li>
              ))}
            </AnimatePresence>
          </ul>
        </section>
      ))}
    </div>
  );
}
