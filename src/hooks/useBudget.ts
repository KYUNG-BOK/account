import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Transaction } from "../types/budget";
import { ym as toYM } from "../lib/format";

const LS_KEY = "budget:tx:v1";

function safeLoad(): Transaction[] {
  try {
    const raw = localStorage.getItem(LS_KEY);
    const arr = raw ? JSON.parse(raw) : [];
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}
function safeSave(items: Transaction[]) {
  try {
    localStorage.setItem(LS_KEY, JSON.stringify(items));
  } catch {}
}

export function useBudget() {
  const [tx, setTx] = useState<Transaction[]>(() => safeLoad());
  const [selectedYM, setSelectedYM] = useState<string>(toYM());
  const syncingRef = useRef(false);

  // 저장
  useEffect(() => {
    if (syncingRef.current) { syncingRef.current = false; return; }
    safeSave(tx);
  }, [tx]);

  // 월별 필터링
  const monthTx = useMemo(() => {
    return tx.filter(t => t.date.startsWith(selectedYM));
  }, [tx, selectedYM]);

  // 합계
  const totals = useMemo(() => {
    const income = monthTx.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
    const expense = monthTx.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTx]);

  // CRUD
  const add = useCallback((t: Transaction) => {
    setTx(prev => [t, ...prev].sort((a,b) => (a.date < b.date ? 1 : -1)));
  }, []);
  const update = useCallback((t: Transaction) => {
    setTx(prev => prev.map(x => x.id === t.id ? t : x).sort((a,b)=> (a.date < b.date ? 1 : -1)));
  }, []);
  const remove = useCallback((id: string) => {
    setTx(prev => prev.filter(x => x.id !== id));
  }, []);
  const clearMonth = useCallback(() => {
    setTx(prev => prev.filter(t => !t.date.startsWith(selectedYM)));
  }, [selectedYM]);

  // Import/Export
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(tx, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "transactions.json"; a.click();
    URL.revokeObjectURL(url);
  }, [tx]);

  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const arr = JSON.parse(text);
    if (!Array.isArray(arr)) throw new Error("잘못된 JSON 형식");
    const valid = arr.filter(it =>
      it && typeof it.id === "string" &&
      typeof it.date === "string" &&
      (it.type === "income" || it.type === "expense") &&
      typeof it.category === "string" &&
      typeof it.amount === "number"
    );
    setTx(prev => [...valid, ...prev].sort((a,b)=> (a.date < b.date ? 1 : -1)));
  }, []);

  return {
    tx, monthTx, totals,
    selectedYM, setSelectedYM,
    add, update, remove, clearMonth,
    exportJSON, importJSON,
  };
}
