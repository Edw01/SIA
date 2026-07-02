export default {
    testEnvironment: 'node',
    transform: {},
    testPathIgnorePatterns: ['/node_modules/'],
    collectCoverage: true,
    collectCoverageFrom: ['backend/**/*.js', '!backend/server.js', '!backend/config/**'],
    coverageDirectory: 'coverage',
    coverageReporters: ['text', 'lcov', 'clover', 'cobertura'],
    coverageThreshold: {
        global: {
            branches: 70,
            functions: 70,
            lines: 70,
            statements: 70
        }
    }
};
