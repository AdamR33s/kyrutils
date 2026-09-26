import { sleepForSeconds } from "./kyrTools.js";

// ---------
// - TYPES -
// ---------
/**
 * Represents a repsonse object from KYR API's
 */
export type KyrApiResponse<T> =
  | {
      success: true;
      message: string;
      data: T;
      error: undefined;
    }
  | {
      success: false;
      message: undefined;
      data: undefined;
      error: string;
    };

/**
 * Represents a config object for the API Manager
 */
export type KyrApiName =
  | "mainapi"
  | "socialsapi"
  | "tarkovapi"
  | "atombot"
  | "communitymanager"
  | "scars"
  | "monitorbot";

/**
 * Represents a config object for the API Manager
 */
export type KyrApiConfig = {
  name: KyrApiName;
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
  private apis = new Map<KyrApiName, KyrApi>();

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
  removeApi(apiName: KyrApiName): boolean {
    return this.apis.delete(apiName);
  }

  async request<T>(
    apiName: KyrApiName,
    method: string,
    targetRoute: string,
    reqBody?: Record<string, string>,
  ): Promise<KyrApiResponse<T>> {
    const api = this.apis.get(apiName);
    if (!api) {
      return buildKyrApiErrorResponse({ error: `${apiName} not found!` });
    }
    return await api.request(method, targetRoute, reqBody);
  }

  /**
   *  @method Used to execute GET requests on selected APIs connected
   *  @param apiName The API name to be targeted
   *  @param targetURL The target route of the API
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async getRequest<T>(apiName: KyrApiName, targetRoute: string): Promise<KyrApiResponse<T>> {
    return this.request(apiName, "GET", targetRoute, undefined);
  }

  /**
   *  @method Used to execute POST requests on selected APIs connected
   *  @param apiName The API name to be targeted
   *  @param targetURL The target route of the API
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async postRequest<T>(
    apiName: KyrApiName,
    targetRoute: string,
    reqBody?: Record<string, string>,
  ): Promise<KyrApiResponse<T>> {
    return this.request(apiName, "POST", targetRoute, reqBody);
  }

  /**
   *  @method Used to attempt the connection on the API
   *  @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async connectApi(apiName: KyrApiName): Promise<KyrApiResponse<null>> {
    const api = this.apis.get(apiName);
    if (!api) {
      return buildKyrApiErrorResponse({ error: `${apiName} not found!` });
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
  private _getHeaders(): Record<string, string> {
    return {
      Authorization: this.config.accessKey,
      "Content-Type": "application/json",
    };
  }

  private async _handleFetchResponse<T>(response: Response): Promise<KyrApiResponse<T>> {
    if (!response.ok) {
      let error = `Request failed with code ${response.status}`;
      try {
        const json: unknown = await response.json();
        if (typeof json == "object" && json != null && "error" in json && typeof json.error == "string") {
          error = `Request failed with code ${response.status}: ${json.error.trim().slice(0, 400)}`;
        }
      } catch {}
      return buildKyrApiErrorResponse({ error });
    }
    try {
      return (await response.json()) as KyrApiResponse<T>;
    } catch (error) {
      return buildKyrApiErrorResponse({ error: "Failed to read response.json(): " + String(error) });
    }
  }

  async request<T>(targetRoute: string, method: string, body?: Record<string, string>): Promise<KyrApiResponse<T>> {
    if (!this.connectionIsActive) {
      return buildKyrApiErrorResponse({ error: `${this.config.name} not active` });
    }
    const targetURL = new URL(targetRoute, this.config.address);
    let response: Response;
    try {
      response = await fetch(targetURL, {
        method: "GET",
        headers: this._getHeaders(),
        signal: AbortSignal.timeout(this.config.getReqTimeoutMs),
      });
    } catch (err) {
      return buildKyrApiErrorResponse({ error: `Fetch error in GET Req: ` + err });
    }
    return await this._handleFetchResponse<T>(response);
  }

  /**
   * @method Used to attempt a connection to the API
   * @returns A KyrApiResponse<T> object standardized for KYR API's
   */
  async connect(): Promise<KyrApiResponse<null>> {
    for (let i = 0; ; i++) {
      if (i > 0) {
        await sleepForSeconds(60);
      }
      const targetURL = new URL(`/connect`, this.config.address);
      let responseObj: KyrApiResponse<null>;
      try {
        const response = await fetch(targetURL, {
          method: "GET",
          headers: this._getHeaders(),
          signal: AbortSignal.timeout(this.config.getReqTimeoutMs),
        });
        responseObj = await this._handleFetchResponse<null>(response);
      } catch (error) {
        responseObj = buildKyrApiErrorResponse({ error: `Fetch error in connect method: ` + error });
      }
      if (responseObj.success) {
        this.connectionAttempts = 0;
        this.connectionIsActive = true;
        return responseObj;
      }
      this.connectionAttempts += 1;
      if (i >= this.config.maxConnectAttempts) {
        // if we're out of retries, return the error so our caller sees at least one of the exceptions.
        return responseObj;
      }
    }
  }
}

// -------------
// - FUNCTIONS -
// -------------
/**
 * Utility function for building a KYR API repsonse object conveniently
 */
export function buildKyrApiResponse<T>({ message, data }: { message: string; data: T }): KyrApiResponse<T> {
  return {
    success: true,
    message,
    error: undefined,
    data,
  };
}

/**
 * Utility function for building a KYR API error repsonse object conveniently
 */
export function buildKyrApiErrorResponse<T>({ error }: { error: string }): KyrApiResponse<T> {
  return {
    success: false,
    message: undefined,
    error: error,
    data: undefined,
  };
}
