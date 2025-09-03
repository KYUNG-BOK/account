import { motion } from "framer-motion";
import { BudgetGrid } from ".";
import type { Transaction } from "../types/budget";

const spring = { type: "spring" as const, stiffness: 300, damping: 22 };

type Props = { transactions: Transaction[] };

export default function AnalysisCard({ transactions }: Props) {
  return (
    <motion.section
      key="analysis"
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -6 }}
      transition={spring}
      className="mb-6"
    >
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-base font-semibold">🔍 분석(그리드 + 차트)</h2>
          <span className="text-xs text-slate-500">
            Enterprise 차트 · 그룹/피벗 · 집계
          </span>
        </div>
        <div className="p-3">
          <BudgetGrid transactions={transactions} />
        </div>
      </div>
    </motion.section>
  );
}
