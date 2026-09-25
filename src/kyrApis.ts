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
export function buildKyrApiResponseObj<T>(
  responseMessage?: string,
  responseError?: string,
  responseData?: T,
): KyrApiResponse<T> {
  return {
    message: responseMessage ?? undefined,
    error: responseError ?? undefined,
    data: responseData ?? undefined,
  };
}