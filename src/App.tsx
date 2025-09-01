import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import clsx from "clsx";
import { formatKRW } from "./lib/format";
import { useBudget } from "./hooks/useBudget";
import type { Transaction } from "./types/budget";
import { SummaryCard, DayHeader, EmptyState, TxModal } from "./components";


type TabKey = "all" | "income" | "expense";
const spring = { type: "spring" as const, stiffness: 300, damping: 22 };

export default function App() {
  const {
    monthTx, totals, selectedYM, setSelectedYM,
    add, update, remove, clearMonth, exportJSON, importJSON,
  } = useBudget();

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");

  const onAdd = () => { setEditing(null); setOpen(true); };
  const onEdit = (t: Transaction) => { setEditing(t); setOpen(true); };

  const filtered = useMemo(() => {
    let list = monthTx;
    if (tab !== "all") list = list.filter(t => t.type === tab);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(t =>
        t.category.toLowerCase().includes(k) ||
        (t.memo ?? "").toLowerCase().includes(k)
      );
    }
    return list;
  }, [monthTx, tab, q]);

  const byDay = useMemo(() => {
    const m = new Map<string, Transaction[]>();
    for (const t of filtered) {
      const arr = m.get(t.date) ?? [];
      arr.push(t);
      m.set(t.date, arr);
    }
    return Array.from(m.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));
  }, [filtered]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-green-50">
      {/* NAVBAR */}
      <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200">
        <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
          <div className="font-semibold text-lg">📒 나만의 가계부 만들기</div>
          <div className="flex items-center gap-2">
            <input
              type="month"
              className="h-9 rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
              value={selectedYM}
              onChange={e => setSelectedYM(e.target.value)}
            />
            <button
              className="h-9 rounded-md bg-sky-600 text-white px-3 text-sm hover:bg-sky-700 active:scale-[0.99] transition"
              onClick={onAdd}
            >
              + 내역 추가
            </button>
            <div className="relative">
              <details className="group">
                <summary className="list-none h-9 leading-9 rounded-md border border-slate-300 px-3 text-sm cursor-pointer hover:bg-slate-50">
                  설정
                </summary>
                <ul className="absolute right-0 mt-2 w-48 rounded-md border border-slate-200 bg-white shadow-lg p-1 text-sm">
                  <li>
                    <button className="w-full px-3 py-2 rounded hover:bg-slate-50 text-left"
                            onClick={exportJSON}>
                      내보내기(JSON)
                    </button>
                  </li>
                  <li>
                    <label className="w-full px-3 py-2 rounded hover:bg-slate-50 block cursor-pointer">
                      가져오기(JSON)
                      <input
                        type="file"
                        accept="application/json"
                        className="hidden"
                        onChange={e => {
                          const f = e.target.files?.[0];
                          if (f) importJSON(f);
                          e.currentTarget.value = "";
                        }}
                      />
                    </label>
                  </li>
                  <li>
                    <button className="w-full px-3 py-2 rounded hover:bg-red-50 text-red-600 text-left"
                            onClick={clearMonth}>
                      이 달 비우기
                    </button>
                  </li>
                </ul>
              </details>
            </div>
          </div>
        </div>
      </header>

      {/* BODY */}
      <div className="mx-auto max-w-5xl px-4 pb-28">
        {/* SUMMARY */}
        <section className="py-6 grid gap-4 md:grid-cols-3">
          <SummaryCard label="수입"   value={totals.income}  tone="success" />
          <SummaryCard label="지출"   value={totals.expense} tone="error" />
          <SummaryCard label="잔액"   value={totals.balance} tone="info" />
        </section>

        {/* FILTER */}
        <section className="mb-4">
          <div className="rounded-xl bg-white border border-slate-200 shadow-sm">
            <div className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-1">
                {(["all","income","expense"] as TabKey[]).map(k => (
                  <button
                    key={k}
                    onClick={() => setTab(k)}
                    className={clsx(
                      "h-8 rounded-full px-3 text-sm transition",
                      tab===k
                        ? "bg-sky-600 text-white"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                    )}
                  >
                    {k==="all"?"전체":k==="income"?"수입":"지출"}
                  </button>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <div className="relative">
                  <input
                    className="h-8 w-56 rounded-md border border-slate-300 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                    placeholder="카테고리/메모 검색"
                    value={q}
                    onChange={e => setQ(e.target.value)}
                  />
                  <span className="absolute left-2 top-1.5 text-slate-400">🔎</span>
                </div>
                {q && (
                  <button
                    className="h-8 rounded-md px-3 text-sm border border-slate-300 hover:bg-slate-50"
                    onClick={() => setQ("")}
                  >
                    지우기
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* LIST */}
        <main>
          {byDay.length === 0 ? (
            <EmptyState onAdd={onAdd} />
          ) : (
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
                          className="rounded-xl bg-white border border-slate-200 shadow-sm"
                        >
                          <div className="p-3 sm:p-4 flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <div className="font-medium truncate">
                                {t.category} {t.memo ? <span className="text-slate-500">· {t.memo}</span> : null}
                              </div>
                              <div className="text-xs text-slate-500">{t.type==="expense"?"지출":"수입"}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <div className={t.type==="expense"?"text-red-600 font-bold":"text-green-600 font-bold"}>
                                {t.type==="expense"?"-":"+"}{formatKRW(t.amount)}
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
                                  onClick={() => remove(t.id)}
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
          )}
        </main>
      </div>

      {/* FAB (모바일) */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 md:hidden h-11 rounded-full px-4 bg-sky-600 text-white shadow-lg"
        onClick={onAdd}
      >
        + 추가
      </motion.button>

      {/* MODAL */}
      <TxModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSave={(next) => { editing ? update(next) : add(next); }}
      />
    </div>
  );
}
