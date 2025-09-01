import clsx from "clsx";
import { motion, type Transition } from "framer-motion";
import { formatKRW } from "../lib/format";

type Tone = "success" | "error" | "info";

const enterSpring: Transition = { type: "spring", stiffness: 300, damping: 22 };
const numberSpring: Transition = { type: "spring", stiffness: 320, damping: 18 };

export default function SummaryCard({
  label,
  value,
  tone,
}: { label: string; value: number; tone: Tone }) {
  const toneRing =
    tone === "success"
      ? "ring-1 ring-green-300"
      : tone === "error"
      ? "ring-1 ring-rose-300"
      : "ring-1 ring-sky-300";

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={enterSpring}
      className={clsx(
        "rounded-xl bg-white border border-slate-200 shadow-sm px-4 py-3",
        toneRing
      )}
    >
      <div className="text-sm text-slate-500">{label}</div>
      <motion.div
        key={value}
        initial={{ scale: 0.96, opacity: 0.8 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={numberSpring}
        className="text-2xl font-extrabold tracking-tight"
      >
        {formatKRW(value)}
      </motion.div>
    </motion.div>
  );
}
