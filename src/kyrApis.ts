import { sleepForSeconds } from "./kyrTools.js";

// ---------
// - TYPES -
// ---------
/**
 * Represents a repsonse object from KYR API's
 */
export type KyrApiResponse<T> = {
  message: string | undefined;
  error: string | undefined;
  data: T | undefined;
}

// --------------------
// - CONNECTION CLASS -
// --------------------
/**
 * @class Represents a connection between KYR Applications
 * @param apiName The name of the API connecting to
 * @param apiAddress The full URL of the API connecting to
 * @param apiKey The string key for the api connecting to
 * @param getReqTimeoutMS The number of ms before a timeout on get requests
 * @param postReqTimeoutMs The number of ms before a timeout on fetch requests
 * @param maxConnectAttemps The max number of connection retries before idling
 * 
 */
export class KyrApiConnection {
  connectionIsActive = false;
  connectionAttempts = 0;

  constructor(
    public apiName: string,
    public apiAddress: URL,
    private apiKey: string,
    public getReqTimeoutMS: number,
    public postReqTimeoutMs: number,
    private maxConnectAttemps: number,
  ) {}

  // -----------
  // - METHODS -
  // -----------
/**
 *  @returns The headers object for this class instance
 * 
 */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: this.apiKey,
      "Content-Type": "application/json",
    };
  }

/**
 *  @method Used to send GET requests to the API once connected
 *  @param targetURL The target URL for the request 
 *  @returns A KyrApiResponse<T> object standardized for KYR API's
 */
  async getRequest<T>(targetURL: URL): Promise<KyrApiResponse<T>> {
    if (!this.connectionIsActive) {
      return buildKyrApiResponseObj({ error: `${this.apiName} not active` });
    }
    let response: Response;
    try {
      response = await fetch(targetURL, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.getReqTimeoutMS),
      });
    } catch (err) {
      return buildKyrApiResponseObj({ error: String(err) });
    }
    const responseObj = (await response.json()) as KyrApiResponse<T>;
    if (!response.ok) {
      return buildKyrApiResponseObj({
        error: `Error ${this.apiName} GET Req:\nTarget: ${targetURL}\nStatus: ${response.status}\nError: ${responseObj.error ?? "Unknown Error"}`,
      });
    }
    return responseObj;
  }

/**
 * @method Used to send POST requests to the API once connected
 * @param targetURL The target URL for the request 
 * @returns A KyrApiResponse<T> object standardized for KYR API's
 */
  async postRequest<T>(targetURL: URL, reqBody?: Record<string, string>): Promise<KyrApiResponse<T>> {
    if (!this.connectionIsActive) {
      return buildKyrApiResponseObj({ error: `${this.apiName} not active` });
    }
    let response: Response;
    try {
      response = await fetch(targetURL, {
        method: "POST",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.postReqTimeoutMs),
        ...(reqBody !== undefined && { body: JSON.stringify(reqBody) }),
      });
    } catch (err) {
      return buildKyrApiResponseObj({ error: String(err) });
    }
    const responseObj = (await response.json()) as KyrApiResponse<T>;
    if (!response.ok) {
      return buildKyrApiResponseObj({
        error: `Error ${this.apiName} POST Req:\nTarget: ${targetURL}\nStatus: ${response.status}\nError: ${responseObj.error ?? "Unknown Error"}`,
      });
    }
    return responseObj;
  }

/**
 * @method Used to attempt a connection to the API
 * @returns A KyrApiResponse<T> object standardized for KYR API's
 */
  async connect(): Promise<boolean> {
    for (let i = 0; i < this.maxConnectAttemps; i++) {
      const targetURL = new URL(`/connect`, this.apiAddress);
      let response = await fetch(targetURL, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.getReqTimeoutMS),
      });
      if (response.ok) {
        this.connectionAttempts = 0;
        this.connectionIsActive = true;
        return true;
      }
      this.connectionAttempts += 1;
      if (i < this.maxConnectAttemps) {
        await sleepForSeconds(60);
      }
    }
    return false;
  }
}

/**
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