import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import MenuTable from "./MenuTable"

describe("MenuTable Component", () => {
    const mockOnClick = jest.fn()

    it("renders the correct content when occupied", () => {
        render(
            <MenuTable
                tableNumber={3}
                price={"100"}
                tableStatus="served"
                onClick={mockOnClick}
                currency={"INR"}
            />
        )

        expect(screen.getByText("Table - 3")).toBeInTheDocument()
        expect(screen.getByText("INR 100")).toBeInTheDocument()
        expect(screen.queryByText("NOT OCCUPIED")).toBeNull()

        fireEvent.click(screen.getByRole("button"))
        expect(mockOnClick).toHaveBeenCalledTimes(1)
    })

    it("renders 'NOT OCCUPIED' content when table is free", () => {
        render(
            <MenuTable
                tableNumber={3}
                price={100}
                tableStatus="not_occupied"
                onClick={mockOnClick}
                currency={"INR"}
            />
        )

        expect(screen.getByText("NOT OCCUPIED")).toBeInTheDocument()
        expect(screen.queryByText("Table - 3")).toBeNull()
        expect(screen.queryByText("INR 100")).toBeNull()
    })
})
