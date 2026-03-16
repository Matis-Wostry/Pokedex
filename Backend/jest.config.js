module.exports = {
    testEnvironment: "node",
    testMatch: ["**/tests/**/*.test.js"],
    setupFilesAfterEnv: ["./src/tests/setup.js"],
    testTimeout: 30000,
};
