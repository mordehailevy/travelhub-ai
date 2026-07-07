/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  rootDir: ".",
  roots: ["<rootDir>/tests"],
  setupFilesAfterEnv: ["<rootDir>/tests/setup.ts"],
  testTimeout: 30000,
  // Each test file spins up its own MongoMemoryServer, and on a cold cache
  // they'd all race to download/rename the same MongoDB binary in parallel.
  // Serial execution avoids that race; the suite is small enough that it
  // doesn't cost much time.
  maxWorkers: 1,
};
