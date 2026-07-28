import { calculateMarketStatus } from "./market-status";

export function shouldRunScheduledMarketQuotes(now = new Date()): boolean {
  if (calculateMarketStatus(now) === "OPEN") return true;
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  const weekday = value("weekday");
  const hour = Number(value("hour"));
  const minute = Number(value("minute"));
  return weekday !== "Sat" && weekday !== "Sun" && hour === 16 && minute < 30;
}
