import type { MarketStatus } from "./types";

export interface ExchangeSession {
  timeZone: string;
  openMinutes: number;
  closeMinutes: number;
  preMarketMinutes: number;
  postMarketMinutes: number;
  holidays?: ReadonlySet<string>;
}

export const ASX_SESSION: ExchangeSession = {
  timeZone: "Australia/Sydney",
  openMinutes: 10 * 60,
  closeMinutes: 16 * 60,
  preMarketMinutes: 3 * 60,
  postMarketMinutes: 3 * 60,
  holidays: new Set(),
};

function zonedParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    weekday: "short",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(date);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value ?? "";
  return {
    dateKey: `${value("year")}-${value("month")}-${value("day")}`,
    weekday: value("weekday"),
    minutes: Number(value("hour")) * 60 + Number(value("minute")),
  };
}

export function calculateMarketStatus(
  date = new Date(),
  session: ExchangeSession = ASX_SESSION,
): MarketStatus {
  const local = zonedParts(date, session.timeZone);
  if (local.weekday === "Sat" || local.weekday === "Sun" || session.holidays?.has(local.dateKey)) return "CLOSED";
  if (local.minutes >= session.openMinutes && local.minutes < session.closeMinutes) return "OPEN";
  if (local.minutes >= session.openMinutes - session.preMarketMinutes && local.minutes < session.openMinutes) return "PRE_MARKET";
  if (local.minutes >= session.closeMinutes && local.minutes < session.closeMinutes + session.postMarketMinutes) return "POST_MARKET";
  return "CLOSED";
}
