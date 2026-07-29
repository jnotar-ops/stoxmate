import "server-only";
import { isCronAuthorised } from "./cron-auth";
import { suppressDuplicateIngestion } from "./ingestion";
import { toPublicIngestionError } from "./route-errors";

export async function respondToIngestionRequest<T>(
  request: Request,
  key: string,
  work: () => Promise<T>,
) {
  if (!isCronAuthorised(request)) {
    return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const run = await suppressDuplicateIngestion(key, work);
    return Response.json({ success: true, run });
  } catch (error) {
    const details = toPublicIngestionError(error);
    console.error(JSON.stringify({
      event: "market_data_ingestion_failed",
      ingestionKey: key,
      details,
    }));
    return Response.json({
      success: false,
      error: `Market-data ingestion failed for ${key}`,
      details,
    }, { status: 500 });
  }
}
