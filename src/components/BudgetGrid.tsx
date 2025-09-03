import { useMemo, useRef } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, GridOptions /*, ChartRef*/ } from "ag-grid-community";
import type { Transaction } from "../types/budget";

type Props = { transactions: Transaction[] };

export default function BudgetGrid({ transactions }: Props) {
  const gridRef = useRef<AgGridReact>(null);
  const chartContainerRef = useRef<HTMLDivElement | null>(null);
  const lastChartRef = useRef<any | null>(null);

  const rowData = useMemo(
    () =>
      transactions.map((t) => ({
        id: t.id,
        date: t.date,                  // YYYY-MM-DD
        type: t.type,                  // "income" | "expense"
        category: t.category,
        memo: t.memo ?? "",
        amount: t.amount,
        signedAmount: t.type === "expense" ? -Math.abs(t.amount) : Math.abs(t.amount),
      })),
    [transactions]
  );

  const columnDefs = useMemo<ColDef[]>(
    () => [
      { field: "date", headerName: "일자", filter: "agDateColumnFilter", enableRowGroup: true, width: 120 },
      { field: "type", headerName: "구분", enableRowGroup: true, filter: true, width: 100 },
      { field: "category", headerName: "카테고리", enableRowGroup: true, filter: true, width: 160 },
      { field: "memo", headerName: "메모", flex: 1, filter: true },
      {
        field: "amount",
        headerName: "금액",
        type: "rightAligned",
        enableValue: true,
        aggFunc: "sum",
        width: 140,
        valueFormatter: (p) => (p.value == null ? "" : Number(p.value).toLocaleString()),
      },
      {
        field: "signedAmount",
        headerName: "±금액",
        type: "rightAligned",
        enableValue: true,
        aggFunc: "sum",
        hide: true, // 콤보 차트용
        valueFormatter: (p) => (p.value == null ? "" : Number(p.value).toLocaleString()),
      },
    ],
    []
  );

  const defaultColDef = useMemo<ColDef>(() => ({ sortable: true, filter: true, resizable: true }), []);

  const gridOptions = useMemo<GridOptions>(
    () => ({
      enableCharts: true,
      cellSelection: true,
      clipboard: { enabled: true },
      statusBar: {
        statusPanels: [
          { statusPanel: "agTotalRowCountComponent", align: "left" },
          { statusPanel: "agAggregationComponent" },
        ],
      },
      sideBar: { toolPanels: ["columns", "filters"] },
    }),
    []
  );

  // 공통 차트 생성기 (이전 차트 날리기 → 새로 생성)
  const openChart = (params: any) => {
    // 1) 이전 차트 제거 (타입 안전)
    lastChartRef.current?.destroyChart?.();
    lastChartRef.current = null;

    // 2) 컨테이너 정리
    if (chartContainerRef.current) chartContainerRef.current.innerHTML = "";

    // 3) 차트 생성 + ref 보관
    lastChartRef.current = gridRef.current!.api.createRangeChart({
      ...params,
      chartContainer: chartContainerRef.current!,
      chartThemeOverrides: {
        common: {
          title: { enabled: true, text: params.title ?? "Analysis" },
          padding: { top: 8, right: 8, bottom: 8, left: 8 }, // 프리뷰 내부여백
        },
        cartesian: {
          legend: { position: "bottom", item: { label: { fontSize: 11 } } },
          axes: {
            category: { label: { rotation: -30, fontSize: 11 } },
            number: { label: { fontSize: 11 } },
          },
        },
      },
    });
  };

  // 버튼 액션
  const openHistogram = () =>
    openChart({ title: "금액 분포 (Histogram)", cellRange: { columns: ["amount"] }, chartType: "histogram" });

  const openHeatmap = () =>
    openChart({
      title: "일자 × 카테고리 (Heatmap)",
      cellRange: { columns: ["date", "category", "amount"] }, // X, Y, 값
      chartType: "heatmap",
    });

  const openCombo = () =>
    openChart({
      title: "카테고리 Bar + ±금액 Line(보조축)",
      cellRange: { columns: ["category", "amount", "signedAmount"] },
      chartType: "customCombo",
      seriesChartTypes: [
        { colId: "amount", chartType: "groupedColumn" },
        { colId: "signedAmount", chartType: "line", secondaryAxis: true },
      ],
    });

  return (
    <div
      style={{ display: "grid", gridTemplateColumns: "minmax(0,1fr) 420px", gap: 12 }}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <strong>📊 나의 소비 확인하기</strong>
          <button className="h-8 rounded-md px-3 text-sm border bg-white" onClick={openHistogram}>
            Histogram
          </button>
          <button className="h-8 rounded-md px-3 text-sm border bg-white" onClick={openHeatmap}>
            Heatmap
          </button>
          <button className="h-8 rounded-md px-3 text-sm border bg-white" onClick={openCombo}>
            Combo(보조축)
          </button>
        </div>

        <div className="ag-theme-quartz min-w-0" style={{ height: 420, width: "100%" }}>
          <AgGridReact
            ref={gridRef}
            rowData={rowData}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            gridOptions={gridOptions}
          />
        </div>
      </div>

      {/* 우: 차트 프리뷰 */}
      <div className="min-w-0">
        <h3 className="m-0 mb-2 text-sm font-medium text-slate-700">🖼️ Chart Preview</h3>
        <div
          ref={chartContainerRef}
          style={{
            border: "1px solid #e5e7eb",
            height: 420,
            padding: 8,
            borderRadius: 8,
            background: "#fff",
            position: "relative",
            overflow: "hidden",
            width: "100%",
          }}
        />
      </div>
    </div>
  );
}
