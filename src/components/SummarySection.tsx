import { SummaryCard } from ".";

type Props = {
  totals: { income: number; expense: number; balance: number };
};

export default function SummarySection({ totals }: Props) {
  return (
    <section className="py-6 grid gap-4 md:grid-cols-3">
      <SummaryCard label="수입" value={totals.income} tone="success" />
      <SummaryCard label="지출" value={totals.expense} tone="error" />
      <SummaryCard label="잔액" value={totals.balance} tone="info" />
    </section>
  );
}
