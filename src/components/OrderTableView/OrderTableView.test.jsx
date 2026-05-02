import React from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import OrderTableView from "./OrderTableView"
import { act } from "react-dom/test-utils"

beforeAll(() => {
    window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
    }))
})

const initialData = [
    {
        id: "1",
        title: "Main Course",
        category: "Chicken Biriyani",
        quantity: 4,
        price: 1000,
    },
]

test("renders OrderTableView with initial data", () => {
    render(<OrderTableView initialDataSource={initialData} />)

    expect(screen.getByText(/Chicken Biriyani/i)).toBeInTheDocument()
    expect(screen.getByText(/4/i)).toBeInTheDocument()
    expect(screen.getByText(/1000/i)).toBeInTheDocument()
})

test("edit quantity and save changes", async () => {
    render(<OrderTableView initialDataSource={initialData} />)

    const editButton = screen.getByRole("img", { name: "edit" })
    fireEvent.click(editButton)

    const quantityInput = screen.getByDisplayValue(/4/i)
    fireEvent.change(quantityInput, { target: { value: "5" } })

    const saveButton = screen.getByRole("button", { name: /save/i })
    await act(async () => fireEvent.click(saveButton))

    const quantityCell = screen.getAllByText("5").find((el) => el.closest("td")) // Finds only quantity in the table cell
    expect(quantityCell).toBeInTheDocument()

    expect(screen.getByText(/1250/i)).toBeInTheDocument()
})

test("undo edit action", async () => {
    render(<OrderTableView initialDataSource={initialData} />)

    const editButton = screen.getAllByLabelText(/edit/i)[0]
    await act(async () => fireEvent.click(editButton))

    const incrementButton = screen.getByRole("img", { name: "plus" })
    const decrementButton = screen.getByRole("img", { name: "minus" })

    fireEvent.click(incrementButton)
    fireEvent.click(decrementButton)

    const undoButton = screen.getAllByLabelText(/undo/i)[0]
    await act(async () => fireEvent.click(undoButton))

    expect(screen.getByText("4")).toBeInTheDocument()

    const saveButton = screen.getByRole("button", { name: /Save/i })
    await act(async () => fireEvent.click(saveButton))
})

test("undo delete action", async () => {
    render(<OrderTableView initialDataSource={initialData} />)

    const deleteButton = screen.getAllByLabelText(/delete/i)[0]
    await act(async () => fireEvent.click(deleteButton))

    const undoButton = screen.getAllByLabelText(/undo/i)[0]
    await act(async () => fireEvent.click(undoButton))

    const restoredItem = await screen.findByText("Chicken Biriyani")
    const restoredRow = restoredItem.closest("tr")
    expect(restoredRow).not.toHaveClass("strikethrough")

    const cancelButton = screen.getByText(/Cancel/i)
    await act(async () => fireEvent.click(cancelButton))
})
