const SECRET_URL_PATTERN = /\b(?:postgres(?:ql)?|https?):\/\/[^\s"'<>]+/gi;

function redactSecrets(value: string): string {
  return value.replace(SECRET_URL_PATTERN, "[redacted-url]").slice(0, 2_000);
}

function errorCause(error: Error): unknown {
  return "cause" in error ? error.cause : undefined;
}

export interface PublicIngestionError {
  message: string;
  code?: string;
  hostname?: string;
  cause?: PublicIngestionError;
}

export function toPublicIngestionError(error: unknown, depth = 0): PublicIngestionError {
  if (!(error instanceof Error)) {
    return { message: redactSecrets(String(error || "Unknown ingestion failure")) };
  }

  const details: PublicIngestionError = {
    message: redactSecrets(error.message || error.name || "Unknown ingestion failure"),
  };
  const record = error as Error & { code?: unknown; hostname?: unknown };

  if (typeof record.code === "string") details.code = record.code;
  if (typeof record.hostname === "string") details.hostname = redactSecrets(record.hostname);

  const cause = errorCause(error);
  if (cause !== undefined && depth < 3) {
    details.cause = toPublicIngestionError(cause, depth + 1);
  }

  return details;
}
