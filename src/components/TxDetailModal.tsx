import { useEffect, useRef } from "react";
import { motion, AnimatePresence, type Transition } from "framer-motion";
import type { Transaction } from "../types/budget";
import { formatKRW, ymdToKorean } from "../lib/format";
import { useLockBodyScroll } from "../hooks/useLockBodyScroll";

type Props = {
  open: boolean;
  onClose: () => void;
  tx: Transaction | null;

  onEdit?: (tx: Transaction) => void;
  onDelete?: (id: string) => void;
};

const enterSpring: Transition = { type: "spring", stiffness: 280, damping: 22 };

export default function TxDetailModal({ open, onClose, tx, onEdit, onDelete }: Props) {
  useLockBodyScroll(open);
  const backdropRef = useRef<HTMLDivElement>(null);

  // ESC 닫기
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // 지도 URL (좌표 우선, 없으면 주소 쿼리)
  const mapEmbedSrc = (() => {
    const lat = tx?.merchant?.lat;
    const lon = tx?.merchant?.lon;
    if (lat != null && lon != null) {
      return `https://www.google.com/maps?q=${lat},${lon}&hl=ko&z=16&output=embed`;
    }
    const q = tx?.merchant?.address ?? tx?.merchant?.name;
    if (q) return `https://www.google.com/maps?q=${encodeURIComponent(q)}&hl=ko&z=16&output=embed`;
    return null;
  })();

  const mapLink = (() => {
    const lat = tx?.merchant?.lat;
    const lon = tx?.merchant?.lon;
    if (lat != null && lon != null) return `https://maps.google.com/?q=${lat},${lon}`;
    const q = tx?.merchant?.address ?? tx?.merchant?.name;
    if (q) return `https://maps.google.com/?q=${encodeURIComponent(q)}`;
    return null;
  })();

  // 백드롭 클릭 닫기
  const onBackdropClick = (e: React.MouseEvent) => {
    if (e.target === backdropRef.current) onClose();
  };

  // 클립보드 복사
  const copy = async (text?: string) => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      // 여기서 토스트 쓰고 싶으면 프로젝트 토스트 함수 호출
    } catch {}
  };

  return (
    <AnimatePresence>
      {open && tx && (
        <motion.div
          ref={backdropRef}
          onMouseDown={onBackdropClick}
          className="fixed inset-0 z-[100] bg-black/50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          aria-modal="true"
          role="dialog"
          aria-labelledby="tx-detail-title"
        >
          <motion.div
            className="w-full max-w-lg rounded-xl bg-white shadow-2xl border border-slate-200 overflow-hidden"
            initial={{ y: 22, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 22, opacity: 0 }}
            transition={enterSpring}
          >
            {/* 헤더 */}
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 id="tx-detail-title" className="text-lg font-bold">상세 내역</h3>
                <p className="text-xs text-slate-500">{ymdToKorean(tx.date)}</p>
              </div>
              <button
                className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                onClick={onClose}
              >
                닫기
              </button>
            </div>

            {/* 본문 */}
            <div className="p-5 space-y-4">
              {/* 금액 & 타입 */}
              <div className="flex items-center justify-between">
                <div className="text-sm text-slate-500">{tx.type === "expense" ? "지출" : "수입"}</div>
                <div className={tx.type === "expense" ? "text-rose-600 font-extrabold text-xl" : "text-green-600 font-extrabold text-xl"}>
                  {tx.type === "expense" ? "-" : "+"}{formatKRW(tx.amount)}
                </div>
              </div>

              {/* 카테고리 / 메모 */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="카테고리">
                  <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-1 text-sm text-slate-700">
                    {tx.category}
                  </span>
                </Field>
                {tx.memo ? (
                  <Field label="메모">
                    <span className="text-sm text-slate-700">{tx.memo}</span>
                  </Field>
                ) : null}
              </div>

              {/* 사용처 */}
              <div className="space-y-2">
                <Field label="사용처">
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium truncate">{tx.merchant?.name ?? "—"}</div>
                      <div className="text-xs text-slate-500 truncate">{tx.merchant?.address ?? "주소 정보 없음"}</div>
                    </div>
                    <div className="shrink-0 flex items-center gap-2">
                      {tx.merchant?.address ? (
                        <button
                          className="h-8 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50 text-xs"
                          onClick={() => copy(tx.merchant?.address)}
                        >
                          주소 복사
                        </button>
                      ) : null}
                      {mapLink ? (
                        <a
                          href={mapLink}
                          target="_blank"
                          rel="noreferrer"
                          className="h-8 px-3 rounded-md bg-sky-600 text-white hover:bg-sky-700 text-xs"
                        >
                          지도앱 열기 ↗
                        </a>
                      ) : null}
                    </div>
                  </div>
                </Field>

                {/* 지도 */}
                {mapEmbedSrc ? (
                  <div className="rounded-lg overflow-hidden border border-slate-200">
                    <iframe
                      title="tx-merchant-map"
                      src={mapEmbedSrc}
                      width="100%"
                      height="280"
                      className="block"
                      loading="lazy"
                    />
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">지도 표시를 위한 위치 정보가 없습니다.</div>
                )}
              </div>
            </div>

            {/* 푸터 액션 */}
            <div className="px-5 py-4 border-t border-slate-200 flex items-center justify-between">
              <div className="text-xs text-slate-500">
                ID: {tx.id}
              </div>
              <div className="flex items-center gap-2">
                {onEdit ? (
                  <button
                    className="h-9 px-3 rounded-md border border-slate-300 text-slate-700 hover:bg-slate-50"
                    onClick={() => onEdit?.(tx)}
                  >
                    수정
                  </button>
                ) : null}
                {onDelete ? (
                  <button
                    className="h-9 px-3 rounded-md bg-rose-600 text-white hover:bg-rose-700"
                    onClick={() => onDelete?.(tx.id)}
                  >
                    삭제
                  </button>
                ) : null}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="text-xs text-slate-500">{label}</div>
      {children}
    </div>
  );
}
