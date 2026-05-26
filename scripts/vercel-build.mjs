import { execSync } from "node:child_process";

const INIT_MIGRATION = "20250521120000_init";

function run(command, { inherit = false } = {}) {
  console.log(`\n> ${command}\n`);
  return execSync(command, {
    stdio: inherit ? "inherit" : "pipe",
    encoding: "utf-8",
  });
}

function runMigrateDeploy() {
  return run("npx prisma migrate deploy");
}

try {
  runMigrateDeploy();
} catch (error) {
  const output = [
    error?.stdout ?? "",
    error?.stderr ?? "",
    error?.message ?? "",
  ].join("\n");

  if (output.includes("P3005") || output.includes("schema is not empty")) {
    console.log(
      "\nDatabase already has tables (e.g. from db push). Baselining init migration...\n"
    );
    run(`npx prisma migrate resolve --applied "${INIT_MIGRATION}"`, {
      inherit: true,
    });
    runMigrateDeploy();
  } else {
    if (output) console.error(output);
    process.exit(1);
  }
}

run("npx next build", { inherit: true });
