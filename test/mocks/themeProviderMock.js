import { jest } from "@jest/globals";

/**
 * Mock utility for themeProvider module
 * Provides a mocked ThemeContext with default theme colors
 */
export const mockThemeProvider = () => {
    const React = jest.requireActual("react");
    return {
        ThemeContext: React.createContext({ themeColors: { primary: "#D87500" } }),
    };
};