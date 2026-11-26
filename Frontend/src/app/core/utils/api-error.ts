import { HttpErrorResponse } from '@angular/common/http';

export function apiErrorMessage(error: unknown, fallback: string): string {
  if (!(error instanceof HttpErrorResponse)) {
    return fallback;
  }

  const detail: unknown = error.error?.detail;
  return typeof detail === 'string' ? detail : fallback;
}
