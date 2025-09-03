type Props = {
  selectedYM: string;
  setSelectedYM: (v: string) => void;
  onAdd: () => void;
  exportJSON: () => void;
  importJSON: (f: File) => void;
  clearMonth: () => void;
};

export default function Navbar({
  selectedYM,
  setSelectedYM,
  onAdd,
  exportJSON,
  importJSON,
  clearMonth,
}: Props) {
  return (
    <header className="sticky top-0 z-50 bg-white/85 backdrop-blur border-b border-slate-200">
      <div className="mx-auto max-w-5xl px-4 h-14 flex items-center justify-between">
        <div className="font-semibold text-lg">📒 나만의 가계부 만들기</div>
        <div className="flex items-center gap-2">
          <input
            type="month"
            className="h-9 rounded-md border border-slate-300 px-2 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400"
            value={selectedYM}
            onChange={(e) => setSelectedYM(e.target.value)}
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
                  <button
                    className="w-full px-3 py-2 rounded hover:bg-slate-50 text-left"
                    onClick={exportJSON}
                  >
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
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) importJSON(f);
                        e.currentTarget.value = "";
                      }}
                    />
                  </label>
                </li>
                <li>
                  <button
                    className="w-full px-3 py-2 rounded hover:bg-red-50 text-red-600 text-left"
                    onClick={clearMonth}
                  >
                    이 달 비우기
                  </button>
                </li>
              </ul>
            </details>
          </div>
        </div>
      </div>
    </header>
  );
}
