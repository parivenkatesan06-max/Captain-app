import React from "react"
import { render, fireEvent } from "@testing-library/react"
import EmptyPlaceHolder from "../EmptyPlaceHolder"

describe("EmptyPlaceHolder Component", () => {
    it.skip("renders correctly with given icon and text", () => {
        const { getByText } = render(
            <EmptyPlaceHolder
                icon={<div data-testid="icon" />}
                text="Add New Dish"
                onClick={() => {}}
            />
        )

        expect(getByText("Add New Dish")).toBeInTheDocument()
        expect(getByText("Add New Dish").previousSibling).toHaveAttribute(
            "data-testid",
            "icon"
        )
    })

    it("calls onClick when clicked and not disabled", () => {
        const handleClick = jest.fn()
        const { getByRole } = render(
            <EmptyPlaceHolder
                icon={<div data-testid="icon" />}
                text="Add New Dish"
                onClick={handleClick}
            />
        )

        fireEvent.click(getByRole("button"))
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("does not call onClick when clicked and disabled", () => {
        const handleClick = jest.fn()
        const { getByRole } = render(
            <EmptyPlaceHolder
                icon={<div data-testid="icon" />}
                text="Add New Dish"
                onClick={handleClick}
                disabled
            />
        )

        fireEvent.click(getByRole("button"))
        expect(handleClick).not.toHaveBeenCalled()
    })

    it.skip("calls onClick when Enter key is pressed and not disabled", () => {
        const handleClick = jest.fn()
        const { getByRole } = render(
            <EmptyPlaceHolder
                icon={<div data-testid="icon" />}
                text="Add New Dish"
                onClick={handleClick}
            />
        )

        fireEvent.keyDown(getByRole("button"), { key: "Enter" })
        expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it("does not call onClick when Enter key is pressed and disabled", () => {
        const handleClick = jest.fn()
        const { getByRole } = render(
            <EmptyPlaceHolder
                icon={<div data-testid="icon" />}
                text="Add New Dish"
                onClick={handleClick}
                disabled
            />
        )

        fireEvent.keyDown(getByRole("button"), { key: "Enter" })
        expect(handleClick).not.toHaveBeenCalled()
    })
})
