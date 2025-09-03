import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useBudget } from "./hooks/useBudget";
import type { Transaction } from "./types/budget";
import {
  Navbar,
  SummarySection,
  FilterBar,
  AnalysisCard,
  TransactionList,
  EmptyState,
  TxModal,
  TxDetailModal,
} from "./components";
import "./gridModules";

type TabKey = "all" | "income" | "expense";

export default function App() {
  const {
    monthTx,
    totals,
    selectedYM,
    setSelectedYM,
    add,
    update,
    remove,
    clearMonth,
    exportJSON,
    importJSON,
  } = useBudget();

  // 상태 관리
  const [tab, setTab] = useState<TabKey>("all");
  const [q, setQ] = useState("");
  const [showAnalysis, setShowAnalysis] = useState(false);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Transaction | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailTx, setDetailTx] = useState<Transaction | null>(null);

  const onAdd = () => {
    setEditing(null);
    setOpen(true);
  };
  const onEdit = (t: Transaction) => {
    setEditing(t);
    setOpen(true);
  };
  const onDetail = (t: Transaction) => {
    setDetailTx(t);
    setDetailOpen(true);
  };

  // 필터링
  const filtered = useMemo(() => {
    let list = monthTx;
    if (tab !== "all") list = list.filter((t) => t.type === tab);
    if (q.trim()) {
      const k = q.trim().toLowerCase();
      list = list.filter(
        (t) =>
          t.category.toLowerCase().includes(k) ||
          (t.memo ?? "").toLowerCase().includes(k)
      );
    }
    return list;
  }, [monthTx, tab, q]);

  // 날짜별 그룹핑
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
      <Navbar
        selectedYM={selectedYM}
        setSelectedYM={setSelectedYM}
        onAdd={onAdd}
        exportJSON={exportJSON}
        importJSON={importJSON}
        clearMonth={clearMonth}
      />

      <div className="mx-auto max-w-5xl px-4 pb-28">
        {/* SUMMARY */}
        <SummarySection totals={totals} />

        {/* FILTER */}
        <FilterBar
          tab={tab}
          setTab={setTab}
          q={q}
          setQ={setQ}
          showAnalysis={showAnalysis}
          setShowAnalysis={setShowAnalysis}
        />

        {/* ANALYSIS */}
        {showAnalysis && <AnalysisCard transactions={filtered} />}

        {/* LIST */}
        <main className="mt-6">
          {byDay.length === 0 ? (
            <EmptyState onAdd={onAdd} />
          ) : (
            <TransactionList
              byDay={byDay}
              onDetail={onDetail}
              onEdit={onEdit}
              onRemove={remove}
            />
          )}
        </main>
      </div>

      {/* FAB (모바일 전용) */}
      <motion.button
        whileTap={{ scale: 0.96 }}
        className="fixed bottom-6 right-6 md:hidden h-11 rounded-full px-4 bg-sky-600 text-white shadow-lg"
        onClick={onAdd}
      >
        + 추가
      </motion.button>

      {/* MODALS */}
      <TxModal
        open={open}
        onClose={() => setOpen(false)}
        initial={editing}
        onSave={(next) => {
          editing ? update(next) : add(next);
        }}
      />
      <TxDetailModal
        open={detailOpen}
        tx={detailTx}
        onClose={() => setDetailOpen(false)}
        onEdit={(_t) => {
          setDetailOpen(false);
        }}
        onDelete={(id) => {
          remove(id);
          setDetailOpen(false);
        }}
      />
    </div>
  );
}
