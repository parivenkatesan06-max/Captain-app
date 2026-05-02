import React from "react"
import { render, screen } from "@testing-library/react"
import MenuItem from "./MenuItem"

describe("MenuItem Component", () => {
    const mockProps = {
        menuname: "Chicken Biryani",
        menucategory: "Main Course",
        price: 250,
        quantity: 10,
        currency: "₹",
        image: "path/to/chicken-biryani.svg",
        onClick: jest.fn(),
    }

    it("renders the content and subcontent", () => {
        render(<MenuItem {...mockProps} />)

        // Check if the main content and subcontent are rendered
        expect(screen.getByText("Chicken Biryani")).toBeInTheDocument()
        expect(screen.getByText("Main Course")).toBeInTheDocument()
    })

    it("displays the correct price and currency", () => {
        render(<MenuItem {...mockProps} />)

        // Check if the price and currency are displayed correctly
        expect(screen.getByText("₹ 250")).toBeInTheDocument()
    })

    it("displays the correct quantity", () => {
        render(<MenuItem {...mockProps} />)

        // Check if the quantity is displayed correctly
        expect(screen.getByText("Qty: 10")).toBeInTheDocument()
    })

    it("renders the image with the correct alt text", () => {
        render(<MenuItem {...mockProps} />)

        // Check if the image is rendered with the correct alt text
        const img = screen.getByAltText("Chicken Biryani")
        expect(img).toBeInTheDocument()
        expect(img).toHaveAttribute("src", "path/to/chicken-biryani.svg")
    })
})
