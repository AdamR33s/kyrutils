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
};

/**
 * Represents a config object for the API Manager
 */
export type KyrApiConfig = {
  name: string;
  address: URL;
  accessKey: string;
  getReqTimeoutMs: number;
  postReqTimeoutMs: number;
  maxConnectAttempts: number;
};

// ----------------------------
// - API MANAGER CLASS -
// ----------------------------
/**
 * @class Represents a connection manager for handing KyrApiConnection instances
 * @param apis A private map for storing connection instances by their name
 */
export class KyrApiManager {
  private apis = new Map<string, KyrApi>();

  /**
   *  @method Used to add APIs to the Manager's Map
   *  @param This requires an Object containing all the API Details
   *  @returns void
   */
  addApi(newApiCfg: KyrApiConfig): void {
    const newConnection = new KyrApi(newApiCfg);
    this.apis.set(newApiCfg.name, newConnection);
  }

  /**
   *  @method Used to remove APIs from the Manager's Map
   *  @param apiName The API name to be removed
   *  @returns boolean, true if removed and false if the key doesn't exist
   */
  removeApi(apiName: string): boolean {
    return this.apis.delete(apiName);
  }

  /**
   *  @method Used to execute GET requests on selected APIs connected
   *  @param apiName The API name to be targeted
   *  @param targetURL The target route of the API
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async getRequest(apiName: string, targetRoute: string): Promise<KyrApiResponse<null>> {
    const api = this.apis.get(apiName);
    if (!api) {
      return buildKyrApiResponseObj({ error: `${apiName} not found!` });
    }
    return await api.getRequest(targetRoute);
  }

  /**
   *  @method Used to execute POST requests on selected APIs connected
   *  @param apiName The API name to be targeted
   *  @param targetURL The target route of the API
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async postRequest(
    apiName: string,
    targetRoute: string,
    reqBody?: Record<string, string>,
  ): Promise<KyrApiResponse<null>> {
    const api = this.apis.get(apiName);
    if (!api) {
      return buildKyrApiResponseObj({ error: `${apiName} not found!` });
    }
    return await api.postRequest(targetRoute, reqBody);
  }

  /**
   *  @method Used to run the connect() method of all stored connections
   *  @returns void
   */
  async connectApi(apiName: string): Promise<KyrApiResponse<null>> {
    const api = this.apis.get(apiName);
    if (!api) {
      return buildKyrApiResponseObj({ error: `${apiName} not found!` });
    }
    return await api.connect();
  }
}

// --------------------
// - CONNECTION CLASS -
// --------------------
/**
 * @class Represents a connection between KYR Applications
 * @param apiName The name of the API
 * @param apiAddress The full URL of the API
 * @param apiKey The string key for the API
 * @param getReqTimeoutMS The number of ms before a timeout on get requests
 * @param postReqTimeoutMs The number of ms before a timeout on fetch requests
 * @param maxConnectAttemps The max number of connection retries before idling
 */
class KyrApi {
  connectionIsActive = false;
  connectionAttempts = 0;

  constructor(private config: KyrApiConfig) {}

  /**
   *  @returns The headers object for this class instance
   *
   */
  private getHeaders(): Record<string, string> {
    return {
      Authorization: this.config.accessKey,
      "Content-Type": "application/json",
    };
  }

  /**
   *  @method Used to send GET requests to the API once connected
   *  @param targetURL The target URL for the request
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async getRequest<T>(targetRoute: string): Promise<KyrApiResponse<T>> {
    if (!this.connectionIsActive) {
      return buildKyrApiResponseObj({ error: `${this.config.name} not active` });
    }
    const targetURL = new URL(targetRoute, this.config.address);
    let response: Response;
    try {
      response = await fetch(targetURL, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.getReqTimeoutMs),
      });
    } catch (err) {
      return buildKyrApiResponseObj({ error: String(err) });
    }
    const responseObj = (await response.json()) as KyrApiResponse<T>;
    if (!response.ok) {
      return buildKyrApiResponseObj({
        error: `Error ${this.config.name} GET Req:\nTarget: ${targetURL}\nStatus: ${response.status}\nError: ${responseObj.error ?? "Unknown Error"}`,
      });
    }
    return responseObj;
  }

  /**
   * @method Used to send POST requests to the API once connected
   * @param targetURL The target URL for the request
   * @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async postRequest<T>(targetRoute: string, reqBody?: Record<string, string>): Promise<KyrApiResponse<T>> {
    if (!this.connectionIsActive) {
      return buildKyrApiResponseObj({ error: `${this.config.name} not active` });
    }
    const targetURL = new URL(targetRoute, this.config.address);
    let response: Response;
    try {
      response = await fetch(targetURL, {
        method: "POST",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.postReqTimeoutMs),
        ...(reqBody !== undefined && { body: JSON.stringify(reqBody) }),
      });
    } catch (err) {
      return buildKyrApiResponseObj({ error: String(err) });
    }
    const responseObj = (await response.json()) as KyrApiResponse<T>;
    if (!response.ok) {
      return buildKyrApiResponseObj({
        error: `Error ${this.config.name} POST Req:\nTarget: ${targetURL}\nStatus: ${response.status}\nError: ${responseObj.error ?? "Unknown Error"}`,
      });
    }
    return responseObj;
  }

  /**
   * @method Used to attempt a connection to the API - WARNING: There is no try/catch on this method, error handling needs to be done at a higher level
   * @returns A Promise<boolean> depending on whether the connection attempt was successful or not
   */
  async connect(): Promise<KyrApiResponse<null>> {
    for (let i = 0; i < this.config.maxConnectAttempts; i++) {
      const targetURL = new URL(`/connect`, this.config.address);
      let response = await fetch(targetURL, {
        method: "GET",
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(this.config.getReqTimeoutMs),
      });
      if (response.ok) {
        this.connectionAttempts = 0;
        this.connectionIsActive = true;
        return buildKyrApiResponseObj({ message: `${this.config.name} connected successfully` });
      }
      this.connectionAttempts += 1;
      if (i < this.config.maxConnectAttempts - 1) {
        await sleepForSeconds(60);
      }
    }
    return buildKyrApiResponseObj({ error: `${this.config.name} could not connect` });
  }
}

// -------------
// - FUNCTIONS -
// -------------
/**
 * Utility function for building a KYR API repsonse object conveniently
 */
export function buildKyrApiResponseObj<T>({
  message,
  error,
  data,
}: {
  message?: string;
  error?: string;
  data?: T;
}): KyrApiResponse<T> {
  return {
    message,
    error,
    data,
  };
}
