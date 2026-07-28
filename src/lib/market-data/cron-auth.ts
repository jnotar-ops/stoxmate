import "server-only";
import { timingSafeEqual } from "node:crypto";

export function isCronAuthorised(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const authorization = request.headers.get("authorization");
  const supplied = authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : request.headers.get("x-cron-secret");
  if (!supplied) return false;
  const expectedBuffer = Buffer.from(expected);
  const suppliedBuffer = Buffer.from(supplied);
  return expectedBuffer.length === suppliedBuffer.length && timingSafeEqual(expectedBuffer, suppliedBuffer);
}
