import type { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import type { SerializedError } from "@reduxjs/toolkit";
import type { ApiError } from "@/types/api/errors";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getStringField(value: unknown, key: string): string | null {
  if (!isRecord(value)) return null;

  const field = value[key];
  return typeof field === "string" ? field : null;
}

function getErrorMessageFromData(data: unknown): string | null {
  if (typeof data === "string" && data.trim()) return data;

  return (
    getStringField(data, "message") ??
    getStringField(data, "error") ??
    getStringField(data, "detail")
  );
}

export function mapFetchBaseQueryError(error: FetchBaseQueryError): ApiError {
  if (typeof error.status === "number") {
    return {
      status: error.status,
      message:
        getErrorMessageFromData(error.data) ??
        `Request failed with status ${error.status}`,
      details: error.data,
    };
  }

  return {
    status: error.status,
    message: error.error,
    details: "data" in error ? error.data : undefined,
  };
}

export function mapSerializedError(error: SerializedError): ApiError {
  return {
    status: "CUSTOM_ERROR",
    message: error.message ?? error.name ?? "Unexpected application error.",
    details: error,
  };
}

export function getApiErrorMessage(error: unknown): string {
  if (isRecord(error) && typeof error.message === "string") {
    return error.message;
  }

  return "Something went wrong. Please try again.";
}

