# 📒 나만의 가계부 (Budget Starter)

> React + TypeScript + Tailwind + Framer Motion 기반 가계부 템플릿  
> 틀은 기본적으로 제공하고, 확장은 저희가 활용했던 AG-GRID & Charts, 지도 API 등을 사용하여 자유롭게 해주시면 됩니다!
> CSS도 원하는대로 꾸미시면 됩니다!

---

## ✨ 주요 기능

- 월별 요약 카드 (수입 / 지출 / 잔액)
- 내역 추가 / 수정 / 삭제 (모달 입력)
- 카테고리 / 메모 검색
- 수입/지출/전체 탭 필터
- JSON Import / Export
- 반응형 레이아웃 (모바일 FAB 버튼)

---

## 🔌 확장 포인트

| 영역         | 기본 제공              | 확장 가능                         |
|--------------|-----------------------|----------------------------------|
| 리스트 뷰    | SimpleListView (카드) | AgGridView (ag-grid 테이블)       |
| 데이터 입출력 | JSON                  | XLSX (Excel, SheetJS 기반)        |
| 상세 모달    | TxModal (폼 입력)     | TxDetailModal (지도, 가맹점 정보) |

---

## 🗂️ 폴더 구조

```
src/
  components/
    index.ts
    SummaryCard.tsx
    DayHeader.tsx
    EmptyState.tsx
    TxModal.tsx
    TxDetailModal.tsx
  hooks/
    useBudget.ts
  lib/
    format.ts
  types/
    budget.ts
App.tsx
main.tsx
```

---

## 🚀 시작하기

```bash
# 설치
npm install

# 실행
npm run dev
```

---

## Demo Image
<img width="991" height="551" alt="image" src="https://github.com/user-attachments/assets/e676ae51-951f-46f5-a29d-2b941bc63fc3" />
<img width="1012" height="693" alt="image" src="https://github.com/user-attachments/assets/b28df6e9-8f5d-4094-916d-494bdcc93d96" />

---

## 📜 라이선스

MIT License
