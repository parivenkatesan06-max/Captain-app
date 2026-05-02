import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ScreenSeatView from "../ScreenSeatView" // Adjust the path as necessary

describe("ScreenSeatView", () => {
    const mockOnClick = jest.fn() // Mock function for click event
    const props = {
        orderId: "123456",
        orderPlacedTime: "Placed at 12:00 PM",
        seatNumber: "A1",
        onClick: mockOnClick,
    }

    beforeEach(() => {
        render(<ScreenSeatView {...props} />)
    })

    test("renders correctly with provided props", () => {
        // Check if the seat number is displayed
        expect(screen.getByText("A1")).toBeInTheDocument()

        // Check if the order ID is displayed
        expect(screen.getByText("# 123456")).toBeInTheDocument()

        // Check if the order placed time is displayed
        expect(screen.getByText("Placed at 12:00 PM")).toBeInTheDocument()
    })

    test("calls onClick when View button is clicked", () => {
        const viewButton = screen.getByRole("button", { name: /view/i })
        fireEvent.click(viewButton)

        // Check if the mock function was called
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })
})
