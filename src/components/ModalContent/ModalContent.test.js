import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import ModalContent from "../ModalContent/ModalContent"
import "@testing-library/jest-dom/extend-expect"

describe("ModalContent", () => {
    const content = () => {
        return (
            <>
                <span>You want to Change theme ?</span>
            </>
        )
    }
    const primaryButtonLabel = "Yes"
    const secondaryButtonLabel = "No"
    const primaryOnClick = jest.fn()
    const secondaryOnClick = jest.fn()

    const setup = (visible = true) => {
        render(
            <ModalContent
                content={content()}
                primaryButtonLabel={primaryButtonLabel}
                secondaryButtonLabel={secondaryButtonLabel}
                primaryOnClick={primaryOnClick}
                secondaryOnClick={secondaryOnClick}
                open={visible}
            />
        )
    }

    test("renders the modal with provided label", () => {
        setup()
        expect(
            screen.getByText("You want to Change theme ?")
        ).toBeInTheDocument()
        expect(screen.getByText(primaryButtonLabel)).toBeInTheDocument()
        expect(screen.getByText(secondaryButtonLabel)).toBeInTheDocument()
    })

    test("calls primaryOnClick when primary button is clicked", () => {
        setup()
        const primaryButton = screen.getByText(primaryButtonLabel)
        fireEvent.click(primaryButton)
        expect(primaryOnClick).toHaveBeenCalledTimes(1)
    })

    test("calls secondaryOnClick when secondary button is clicked", () => {
        setup()
        const secondaryButton = screen.getByText(secondaryButtonLabel)
        fireEvent.click(secondaryButton)
        expect(secondaryOnClick).toHaveBeenCalledTimes(1)
    })

    test("does not render modal when visible is false", () => {
        setup(false)
        expect(
            screen.queryByText("You want to Change theme ?")
        ).not.toBeInTheDocument()
    })
})
