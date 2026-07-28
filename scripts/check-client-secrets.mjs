import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const root = join(process.cwd(), ".next", "static");
if (!existsSync(root)) {
  console.error("Client bundle directory .next/static does not exist. Run the production build first.");
  process.exit(1);
}

const secretNames = ["TWELVE_DATA_API_KEY", "COINGECKO_API_KEY", "CRON_SECRET", "DATABASE_URL"];
const configuredValues = secretNames.map((name) => process.env[name]).filter((value) => value && value.length >= 8);
const files = [];
const visit = (directory) => {
  for (const name of readdirSync(directory)) {
    const path = join(directory, name);
    if (statSync(path).isDirectory()) visit(path);
    else files.push(path);
  }
};
visit(root);

const findings = [];
for (const file of files) {
  const content = readFileSync(file, "utf8");
  for (const name of secretNames) if (content.includes(name)) findings.push(`${file}: environment name ${name}`);
  for (const value of configuredValues) if (content.includes(value)) findings.push(`${file}: configured secret value`);
}
if (findings.length) {
  console.error(findings.join("\n"));
  process.exit(1);
}
console.log(`Checked ${files.length} client bundle files: no provider/database/cron secrets found.`);
