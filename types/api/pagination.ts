export type Page<T> = {
  content: T[];
  totalElements: number;
  totalPages: number;
  numberOfElements: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
  empty: boolean;
};

export type PageRequest = {
  page?: number;
  size?: number;
  sort?: string;
};

