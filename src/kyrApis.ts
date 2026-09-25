import { sleepForSeconds } from "./kyrTools.js";

// ----------------------------
// - CONNECTION MANAGER CLASS -
// ----------------------------
/**
 * @class Represents a connection manager for handing KyrApiConnection instances
 * @param connections A map for storing connection instances by their name
 */
export class KyrApiConnectionsManager {
  private connections = new Map<string, KyrApiConnection>();

/**
 *  @method Used to add connections to the Manager's Map
 *  @param newConnection The connection instance to be added
 *  @returns void
 */
  addApiConnection(newConnection: KyrApiConnection): void {
    this.connections.set(newConnection.apiName, newConnection);
  }

/**
 *  @method Used to get connections from the Manager's Map
 *  @param connectionName The connection name to be returned
 *  @returns The KyrApiConnection if it exists, or undefined if not
 */
  getApiConnection(connectionName: string): KyrApiConnection | undefined {
    return this.connections.get(connectionName);
  }

/**
 *  @method Used to remove connections from the Manager's Map
 *  @param connectionName The connection name to be removed
 *  @returns boolean, true if removed and false if the key doesn't exist
 */
  removeApiConnection(connectionName: string): boolean {
    return this.connections.delete(connectionName);
  }

/**
 *  @method Used to run the connect() method of all stored connections
 *  @returns void
 */
  async connectAll(): Promise<void> {
    for (const apiConnection of this.connections.values()) {
      await apiConnection.connect();
    }
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
 * @method Used to attempt a connection to the API - WARNING: There is no try/catch on this method, error handling needs to be done at a higher level
 * @returns A Promise<boolean> depending on whether the connection attempt was successful or not
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