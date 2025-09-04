import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Transaction } from "../types/budget";
import { ym as toYM } from "../lib/format";
import * as XLSX from "xlsx";

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

function excelSerialToDateString(v: unknown): string {
  if (typeof v === "number") {
    const ms = (v - 25569) * 86400 * 1000; // 25569 = 1970-01-01
    const d = new Date(ms);
    if (!isNaN(d.getTime())) {
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const dd = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${dd}`;
    }
  }
  if (typeof v === "string" && v.trim()) {
    const s = v.trim().replace(/[./]/g, "-");
    const [yy, mm, dd] = s.split("-").map((x) => x.padStart(2, "0"));
    if (yy && mm && dd) return `${yy}-${mm}-${dd}`;
  }
  return "";
}

function normNum(x: unknown): number {
  if (typeof x === "number") return x;
  return Number(String(x ?? "").replace(/[^0-9.-]/g, "")) || 0;
}

type TxType = Transaction["type"];
function normType(x: unknown): TxType {
  const s = String(x ?? "").toLowerCase();
  if (s.includes("지출") || s === "expense") return "expense";
  if (s.includes("수입") || s === "income") return "income";
  return "expense";
}

function uuid(): string {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `tx-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  );
}

export function useBudget() {
  const [tx, setTx] = useState<Transaction[]>(() => safeLoad());
  const [selectedYM, setSelectedYM] = useState<string>(toYM());
  const syncingRef = useRef(false);

  // 저장
  useEffect(() => {
    if (syncingRef.current) {
      syncingRef.current = false;
      return;
    }
    safeSave(tx);
  }, [tx]);

  // 월별 필터링
  const monthTx = useMemo(() => {
    return tx.filter((t) => t.date.startsWith(selectedYM));
  }, [tx, selectedYM]);

  // 합계
  const totals = useMemo(() => {
    const income = monthTx
      .filter((t) => t.type === "income")
      .reduce((s, t) => s + t.amount, 0);
    const expense = monthTx
      .filter((t) => t.type === "expense")
      .reduce((s, t) => s + t.amount, 0);
    return { income, expense, balance: income - expense };
  }, [monthTx]);

  // CRUD
  const add = useCallback((t: Transaction) => {
    setTx((prev) =>
      [t, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1))
    );
  }, []);
  const update = useCallback((t: Transaction) => {
    setTx((prev) =>
      prev
        .map((x) => (x.id === t.id ? t : x))
        .sort((a, b) => (a.date < b.date ? 1 : -1))
    );
  }, []);
  const remove = useCallback((id: string) => {
    setTx((prev) => prev.filter((x) => x.id !== id));
  }, []);
  const clearMonth = useCallback(() => {
    setTx((prev) => prev.filter((t) => !t.date.startsWith(selectedYM)));
  }, [selectedYM]);

  // Export JSON
  const exportJSON = useCallback(() => {
    const blob = new Blob([JSON.stringify(tx, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "transactions.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [tx]);

  // Import JSON
  const importJSON = useCallback(async (file: File) => {
    const text = await file.text();
    const arr = JSON.parse(text) as unknown;
    if (!Array.isArray(arr)) throw new Error("잘못된 JSON 형식");

    const valid: Transaction[] = (arr as any[]).filter(
      (it) =>
        it &&
        typeof it.id === "string" &&
        typeof it.date === "string" &&
        (it.type === "income" || it.type === "expense") &&
        typeof it.category === "string" &&
        typeof it.amount === "number"
    );
    setTx((prev) =>
      [...valid, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1))
    );
  }, []);

  // Import Excel (.xlsx/.xls)
const importExcel = useCallback(async (file: File) => {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  if (!ws) return;

  // 2D 배열
  const rows = XLSX.utils.sheet_to_json<(string | number)[]>(ws, {
    header: 1,
    defval: "",
  });
  if (!rows.length) return;

  const normalize = (s: unknown) =>
    String(s ?? "").replace(/\uFEFF/g, "").trim().toLowerCase();

  const header = rows[0].map(normalize);

  // 컬럼 인덱스 매핑(한글/영어)
  const idx = {
    id: header.findIndex((h) => ["id", "아이디", "번호"].includes(h)),
    date: header.findIndex((h) => ["date", "날짜"].includes(h)),
    type: header.findIndex((h) => ["type", "구분"].includes(h)),
    category: header.findIndex((h) => ["category", "카테고리"].includes(h)),
    amount: header.findIndex((h) => ["amount", "금액"].includes(h)),
    memo: header.findIndex((h) => ["memo", "메모"].includes(h)),
  };

  const body = rows.slice(1);

  const parsed: (Transaction | null)[] = body.map((arr): Transaction | null => {
    const id = idx.id >= 0 ? String(arr[idx.id] ?? "").trim() : "";
    const date = idx.date >= 0 ? excelSerialToDateString(arr[idx.date]) : "";
    const type = (idx.type >= 0 ? normType(arr[idx.type]) : "expense") as TxType;
    const category = idx.category >= 0 ? String(arr[idx.category] ?? "").trim() : "";
    const amount = idx.amount >= 0 ? normNum(arr[idx.amount]) : 0;
    const memoRaw = idx.memo >= 0 ? String(arr[idx.memo] ?? "").trim() : "";
    const memo = memoRaw || undefined; 

    // 필수값 검증하기
    if (!date || !category || !amount) return null;

    return { id: id || uuid(), date, type, category, amount, memo };
  });

  // null 제거를 위한 타입가드
  const valid = parsed.filter((x): x is Transaction => x !== null);

  setTx((prev) => [...valid, ...prev].sort((a, b) => (a.date < b.date ? 1 : -1)));
}, []);


  return {
    tx,
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
    importExcel,
  };
}
