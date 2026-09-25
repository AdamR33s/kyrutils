/**
 *
 * Represents a repsonse object from KYR API's
 */
export type KyrApiResponse<T> = {
  message: string | undefined;
  error: string | undefined;
  data: T | undefined;
}

/**
 *
 * Utility function for building a KYR API repsonse object
 */
export function buildKyrApiResponseObj<T>({
  message,
  error,
  data,
}:  {
  message?: string,
  error?: string,
  data?: T,
}): KyrApiResponse<T> {
  return {
    message,
    error,
    data,
  };
}