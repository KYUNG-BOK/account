import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Transaction, TxType } from "../types/budget";
import { ymd } from "../lib/format";
import clsx from "clsx";

type Props = {
  open: boolean;
  onClose: () => void;
  initial?: Transaction | null;
  onSave: (tx: Transaction) => void;
};

const categories = {
  income: ["급여", "보너스", "용돈", "기타"],
  expense: ["식비", "교통", "주거", "문화", "쇼핑", "기타"],
};

export default function TxModal({ open, onClose, initial, onSave }: Props) {
  const ref = useRef<HTMLDialogElement>(null);
  const [date, setDate] = useState<string>(initial?.date ?? ymd());
  const [type, setType] = useState<TxType>(initial?.type ?? "expense");
  const [category, setCategory] = useState<string>(initial?.category ?? (type === "income" ? "급여" : "식비"));
  const [amount, setAmount] = useState<string>(initial ? String(initial.amount) : "");
  const [memo, setMemo] = useState<string>(initial?.memo ?? "");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (open && !el.open) el.showModal();
    if (!open && el.open) el.close();

    const closeHandler = () => onClose?.();
    el.addEventListener("close", closeHandler);
    return () => el.removeEventListener("close", closeHandler);
  }, [open, onClose]);

  useEffect(() => {
    setDate(initial?.date ?? ymd());
    setType(initial?.type ?? "expense");
    setCategory(initial?.category ?? (initial?.type === "income" ? "급여" : "식비"));
    setAmount(initial ? String(initial.amount) : "");
    setMemo(initial?.memo ?? "");
  }, [initial]);

  const submit = () => {
    const amt = Number(amount);
    if (!date || !category || isNaN(amt) || amt <= 0) return;
    const next: Transaction = {
      id: initial?.id ?? crypto.randomUUID(),
      date, type, category, amount: amt, memo: memo || undefined,
    };
    onSave(next);
    onClose();
  };

  return (
    <dialog ref={ref} className="m-0 p-0 bg-transparent">
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 grid place-items-center">
            <motion.div
              key="panel"
              initial={{ y: 30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 30, opacity: 0 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="w-[min(92vw,560px)] rounded-2xl bg-white shadow-2xl border border-slate-200"
            >
              <div className="p-5 space-y-4">
                <h3 className="font-bold text-lg">내역 추가</h3>

                <div className="grid gap-3">
                  {/* 날짜 + 종류 */}
                  <div className="grid grid-cols-[1fr_auto] gap-2">
                    <input
                      type="date"
                      className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                      value={date}
                      onChange={e => setDate(e.target.value)}
                    />
                    <div className="flex items-center gap-1">
                      {(["expense","income"] as TxType[]).map(v => (
                        <button
                          key={v}
                          className={clsx(
                            "h-10 rounded-md px-3 text-sm transition",
                            type===v ? "bg-sky-600 text-white" : "bg-slate-100 hover:bg-slate-200"
                          )}
                          onClick={() => { setType(v); setCategory(v==="income"?"급여":"식비"); }}
                        >
                          {v==="expense"?"지출":"수입"}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* 카테고리 */}
                  <select
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                  >
                    {categories[type].map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>

                  {/* 금액 */}
                  <input
                    type="number"
                    min={1}
                    placeholder="예: 12000"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    value={amount}
                    onChange={e => setAmount(e.target.value)}
                  />

                  {/* 메모 */}
                  <input
                    placeholder="예: 점심 김밥 (선택)"
                    className="h-10 rounded-md border border-slate-300 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    value={memo}
                    onChange={e => setMemo(e.target.value)}
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    className="h-10 rounded-md px-4 border border-slate-300 hover:bg-slate-50"
                    onClick={onClose}
                  >
                    취소
                  </button>
                  <button
                    className="h-10 rounded-md px-4 bg-sky-600 text-white hover:bg-sky-700"
                    onClick={submit}
                  >
                    {initial ? "저장" : "추가"}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <form method="dialog" className="hidden"><button>close</button></form>
    </dialog>
  );
}
