export type Quantity = {
  u: string;
  d: number;
  s: number;
  min: number;
};

export type TrekItem = {
  id: string;
  n: string;
  w: number;
  note?: string;
  q?: Quantity;
};

export type TrekSection = {
  id: string;
  t: string;
  items: TrekItem[];
  prof?: string;
  type?: "custom";
};

export type TrekState = {
  chk: Record<string, boolean>;
  qty: Record<string, number>;
  wov: Record<string, number>;
  off: Record<string, boolean>;
  prof: Record<string, boolean>;
  open: Record<string, boolean>;
  extra: TrekItem[];
};

export type SectionStats = {
  kg: number;
  done: number;
  total: number;
  off: number;
};

export type TrekTotals = SectionStats & {
  ghost: number;
  bySection: Record<string, SectionStats>;
};
