import { randomUUID } from "crypto";

/**
 *
 * @returns A random string identifier
 */
export function getRandUuid(): string {
  return randomUUID();
}

/**
 *
 * @param seconds The number of seconds wanted as wait time
 * @returns Void
 */
export function sleep(seconds: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, seconds * 1000);
  });
}

/**
 *
 * @param previousDate The past date to check time difference from
 * @param minutesDifference The time difference in Minutes to check for
 * @returns boolean
 */
export function minutesElapsed(previousDate: Date | null, minutesDifference: number): boolean {
  if (previousDate === null) {
    return true;
  }
  const currentTime = Date.now();
  const previousTime = previousDate.getTime();
  const timeDifference = currentTime - previousTime;
  const minutesSinceLastCheck = timeDifference / (1000 * 60);
  return minutesSinceLastCheck >= minutesDifference;
}

/**
 *
 * @param previousDate The past date to check time difference from
 * @param minutesDifference The time difference in Hours to check for
 * @returns boolean
 */
export function hoursElapsed(previousDate: Date | null, hoursDifference: number): boolean {
  if (previousDate === null) {
    return true;
  }
  const currentTime = Date.now();
  const previousTime = previousDate.getTime();
  const timeDifference = currentTime - previousTime;
  const hoursSinceLastCheck = timeDifference / (1000 * 60 * 60);
  return hoursSinceLastCheck >= hoursDifference;
}

/**
 *
 * @param array The Array to be suffled
 * @returns The Array in random order
 */
export function shuffleArray<T>(array: Array<T>): Array<T> {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}

/**
 *
 * @param array The Array to select a random element from
 * @returns The randomly selected element from the Array
 */
export function chooseRandomFromArray<T>(array: Array<T>): T | null {
  if (array.length === 0) return null;
  return array[Math.floor(Math.random() * array.length)];
}

/**
 *
 * @param dateInput A string, number(timestamp) or Date
 * @returns A UI friendly timestamp string
 */
export async function dateTimeUIString(dateInput: string | number | Date): Promise<string> {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date passed to dateString(): ${dateInput}`);
  }
  const dateString = date.toLocaleDateString("en-GB", {
    weekday: "short",
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeString = date.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
  return `${dateString}, ${timeString} UTC`;
}

/**
 *
 * @param dateInput A string, number(timestamp) or Date
 * @returns A filesystem friendly timestamp string
 */
export async function dateTimeFsString(dateInput: string | number | Date): Promise<string> {
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) {
    throw new Error(`Invalid date passed to dateString(): ${dateInput}`);
  }
  const dateString = date.toLocaleDateString("en-GB", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    timeZone: "UTC",
  });
  const timeString = date.toLocaleTimeString("en-GB", {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    timeZone: "UTC",
  });
  return `${dateString.replace(/\//g, `-`)}_${timeString.replace(/:/g, `-`)}`;
}
