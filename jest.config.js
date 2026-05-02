module.exports = {
    collectCoverage: true,
    collectCoverageFrom: ["src/**/*.{js,jsx}", "!<rootDir>/node_modules/","<rootDir>/src/pages/"],
    coveragePathIgnorePatterns: ["<rootDir>/src/reportWebVitals.js", "<rootDir>/src/index.js","<rootDir>/src/pages/"],
    coverageDirectory: "coverage",
    testEnvironment: "jsdom",
    setupFilesAfterEnv: ["@testing-library/jest-dom"],
    coverageThreshold: {
        global: {
            branches: 85,
            functions: 85,
            lines: 85,
            statements: 85,
        },
    },
    testPathIgnorePatterns: ["<rootDir>/node_modules/","<rootDir>/src/pages/"],
    transformIgnorePatterns: [],
    transform: {
        "^.+\\.(j)sx?$": "babel-jest",
    },
    moduleNameMapper: {
        "\\.(scss|less|css)$": "identity-obj-proxy",
        "\\.svg$": "jest-svg-transformer",
        "\\.(png|jpg|jpeg|gif)$": "identity-obj-proxy",
    },
}