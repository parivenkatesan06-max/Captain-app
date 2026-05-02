// ScreenWidget.test.js

import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import ScreenWidget from "../ScreenWidget"; // Adjust the import path as necessary

describe("ScreenWidget Component", () => {
    const mockOnClick = jest.fn(); // Mock function for the onClick prop

    beforeEach(() => {
        render(<ScreenWidget screenNumber={1} onClick={mockOnClick} />);
    });

    it("renders without crashing", () => {
        // Check if the component renders the icon and text correctly
        expect(screen.getByText("Screen 2")).toBeInTheDocument();
        expect(screen.getByRole("button")).toBeInTheDocument();
    });

    it("calls onClick when clicked", () => {
        // Simulate a click on the ScreenWidget
        fireEvent.click(screen.getByRole("button"));
        expect(mockOnClick).toHaveBeenCalledWith(1); // Check if the mock function is called with the correct argument
    });

    it("calls onClick when Enter key is pressed", () => {
        // Simulate pressing the Enter key
        fireEvent.keyDown(screen.getByRole("button"), { key: "Enter", code: "Enter" });
        expect(mockOnClick).toHaveBeenCalledWith(1); // Check if the mock function is called with the correct argument
    });

    it("calls onClick when Space key is pressed", () => {
        // Simulate pressing the Space key
        fireEvent.keyDown(screen.getByRole("button"), { key: " ", code: "Space" });
        expect(mockOnClick).toHaveBeenCalledWith(1); // Check if the mock function is called with the correct argument
    });

    it("does not call onClick when another key is pressed", () => {
        // Simulate a key press with a key other than Enter or Space
        fireEvent.keyDown(screen.getByRole("button"), { key: "a", code: "KeyA" });
        expect(mockOnClick).not.toHaveBeenCalled(); // Ensure the mock function is not called
    });
});
