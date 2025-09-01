export type TxType = "income" | "expense";

export type Transaction = {
  id: string;
  date: string;        // YYYY-MM-DD
  type: TxType;
  category: string;
  amount: number;
  memo?: string;

  // 상세 모달에 쓸 사용처 정보
  merchant?: {
    name?: string;
    address?: string;
    lat?: number;
    lon?: number;
  };
};
