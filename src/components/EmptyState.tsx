import { motion } from "framer-motion";

type Props = {
  onAdd: () => void;
};

const springTransition = { type: "spring" as const, stiffness: 300, damping: 22 };

export default function EmptyState({ onAdd }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={springTransition}
      className="rounded-xl bg-white border border-slate-200 shadow-sm"
    >
      <div className="p-8 text-center space-y-3">
        <div className="text-4xl">🗂️</div>
        <h3 className="text-lg font-bold">이번 달 내역이 없어요</h3>
        <p className="text-slate-500 text-sm">
          상단의 <b>월</b>을 바꾸거나, <b>+ 내역 추가</b> 버튼으로 기록을 시작해 보세요.
        </p>
        <button
          className="h-10 rounded-md bg-sky-600 text-white px-4 hover:bg-sky-700"
          onClick={onAdd}
        >
          지금 추가하기
        </button>
      </div>
    </motion.div>
  );
}
