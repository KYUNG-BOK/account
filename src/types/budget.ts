export type TxType = "income" | "expense";

export interface Transaction {
  id: string; 
  date: string; 
  type: TxType;
  category: string;
  memo?: string;
  amount: number;
}
