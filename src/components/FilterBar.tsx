import clsx from "clsx";

type TabKey = "all" | "income" | "expense";

type Props = {
  tab: TabKey;
  setTab: (t: TabKey) => void;
  q: string;
  setQ: (v: string) => void;
  showAnalysis: boolean;
  setShowAnalysis: (v: boolean) => void;
};

export default function FilterBar({
  tab,
  setTab,
  q,
  setQ,
  showAnalysis,
  setShowAnalysis,
}: Props) {
  return (
    <section className="mb-4">
      <div className="rounded-xl bg-white border border-slate-200 shadow-sm">
        <div className="p-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-1">
            {(["all", "income", "expense"] as TabKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setTab(k)}
                className={clsx(
                  "h-8 rounded-full px-3 text-sm transition",
                  tab === k
                    ? "bg-sky-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                )}
              >
                {k === "all" ? "전체" : k === "income" ? "수입" : "지출"}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <div className="relative">
              <input
                className="h-8 w-56 rounded-md border border-slate-300 pl-8 pr-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
                placeholder="카테고리/메모 검색"
                value={q}
                onChange={(e) => setQ(e.target.value)}
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
            <button
              className={clsx(
                "h-8 rounded-md px-3 text-sm transition border",
                showAnalysis
                  ? "bg-sky-600 text-white border-sky-600 hover:bg-sky-700"
                  : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"
              )}
              onClick={() => setShowAnalysis(!showAnalysis)}
              aria-pressed={showAnalysis}
            >
              {showAnalysis ? "분석 닫기" : "분석 보기"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
