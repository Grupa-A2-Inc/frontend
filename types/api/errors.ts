export type ApiErrorStatus =
  | number
  | "FETCH_ERROR"
  | "PARSING_ERROR"
  | "TIMEOUT_ERROR"
  | "CUSTOM_ERROR";

export type ApiError = {
  status: ApiErrorStatus;
  message: string;
  details?: unknown;
};

