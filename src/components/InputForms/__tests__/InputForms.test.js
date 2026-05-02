import React, { createRef } from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import InputForms from "../InputForms"

// Mocking matchMedia directly in the test file
beforeAll(() => {
    global.matchMedia = jest.fn().mockImplementation((query) => {
        return {
            matches: false,
            media: query,
            onchange: null,
            addListener: jest.fn(), // Deprecated
            removeListener: jest.fn(), // Deprecated
            addEventListener: jest.fn(),
            removeEventListener: jest.fn(),
            dispatchEvent: jest.fn(),
        }
    })
})

// Mock the config object
const mockConfig = {
    inputs: {
        password: {
            id: 1,
            name: "password",
            label: "Password",
            required: true,
            placeholder: "Enter your password",
            validationMessages: {
                required: "Password is required",
                mismatch: "Passwords do not match",
            },
            inputConfig: {
                minLength: 6,
            },
        },
        confirmPassword: {
            id: 2,
            name: "confirmPassword",
            label: "Confirm Password",
            required: true,
            placeholder: "Confirm your password",
            validationMessages: {
                required: "Confirm Password is required",
                mismatch: "Passwords do not match",
            },
            inputConfig: {
                minLength: 6,
            },
        },
    },
}

// Test suite for InputForms component
describe("InputForms component", () => {
    test("renders password and confirm password fields", () => {
        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        expect(passwordInputs[0]).toBeInTheDocument()
        const confirmPasswordInputs =
            screen.getAllByLabelText(/Confirm Password/i)
        expect(confirmPasswordInputs[0]).toBeInTheDocument()
    })

    test("renders username fields", () => {
        const mockConfig = {
            inputs: {
                username: {
                    id: "username",
                    name: "username",
                    label: "Enter User Name",
                    required: true,
                    placeholder: "Enter User Name",
                    validationMessages: {
                        required: "User name is required",
                    },
                },
            },
        }
        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)
        const userInputs = screen.getAllByLabelText(/Enter User Name/i)
        expect(userInputs[0]).toBeInTheDocument()
    })

    test("renders email field", () => {
        const mockConfig = {
            inputs: {
                email: {
                    id: "email",
                    name: "email",
                    label: "Enter Email Address",
                    required: true,
                    placeholder: "Enter Email Address",
                    validationMessages: {
                        required: "Email is required",
                        pattern: "Invalid email format",
                    },
                    inputConfig: {
                        regexp: "^\\w+([\\.-]?\\w+)@\\w+([\\.-]?\\w+)(\\.\\w{2,3})+$",
                    },
                },
            },
        }

        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)

        const emailInput = screen.getByLabelText(/Enter Email Address/i)
        expect(emailInput).toBeInTheDocument()
    })

    // Test for required field validation
    test("shows required error message when email field is empty", async () => {
        const mockConfig = {
            inputs: {
                email: {
                    id: "email",
                    name: "email",
                    label: "Enter Email Address",
                    required: true,
                    placeholder: "Enter Email Address",
                    validationMessages: {
                        required: "Email is required",
                        pattern: "Invalid email format",
                    },
                    inputConfig: {
                        regexp: "^\\w+([\\.-]?\\w+)@\\w+([\\.-]?\\w+)(\\.\\w{2,3})+$",
                    },
                },
            },
        }

        const mockOnValuesChange = jest.fn()
        const textFieldRef = createRef()

        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Call validateAndCheck without entering any email
        await textFieldRef.current.validateAndCheck()

        // Expect the required error message to be displayed
        expect(
            await screen.findByText(/Email is required/i)
        ).toBeInTheDocument()
    })

    // Test for pattern validation
    test("shows pattern error message for invalid email format", async () => {
        const mockConfig = {
            inputs: {
                email: {
                    id: "email",
                    name: "email",
                    label: "Enter Email Address",
                    required: true,
                    placeholder: "Enter Email Address",
                    validationMessages: {
                        required: "Email is required",
                        pattern: "Invalid email format",
                    },
                    inputConfig: {
                        regexp: "^\\w+([\\.-]?\\w+)@\\w+([\\.-]?\\w+)(\\.\\w{2,3})+$",
                    },
                },
            },
        }

        const mockOnValuesChange = jest.fn()
        const textFieldRef = createRef()

        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Enter an invalid email
        fireEvent.change(screen.getByLabelText(/Enter Email Address/i), {
            target: { value: "invalid-email" },
        })

        // Call validateAndCheck
        await textFieldRef.current.validateAndCheck()

        // Expect the pattern error message to be displayed
        expect(
            await screen.findByText(/Invalid email format/i)
        ).toBeInTheDocument()
    })

    // Test for valid email input
    test("does not show error message for valid email", async () => {
        const mockConfig = {
            inputs: {
                email: {
                    id: "email",
                    name: "email",
                    label: "Enter Email Address",
                    required: true,
                    placeholder: "Enter Email Address",
                    validationMessages: {
                        required: "Email is required",
                        pattern: "Invalid email format",
                    },
                    inputConfig: {
                        regexp: "^\\w+([\\.-]?\\w+)@\\w+([\\.-]?\\w+)(\\.\\w{2,3})+$",
                    },
                },
            },
        }

        const mockOnValuesChange = jest.fn()
        const textFieldRef = createRef()

        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Enter a valid email
        fireEvent.change(screen.getByLabelText(/Enter Email Address/i), {
            target: { value: "test@example.com" },
        })

        // Call validateAndCheck
        await textFieldRef.current.validateAndCheck()

        // Ensure that no error messages are displayed
        expect(
            screen.queryByText(/Invalid email format/i)
        ).not.toBeInTheDocument()
        expect(screen.queryByText(/Email is required/i)).not.toBeInTheDocument()
    })

    test("validates fields correctly and calls onValuesChange with valid data", async () => {
        const mockOnValuesChange = jest.fn()
        const textFieldRef = createRef()

        // Render the TextField component with the ref
        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Fill in the fields with valid data
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        const confirmPasswordInputs =
            screen.getAllByLabelText(/Confirm Password/i)

        fireEvent.change(passwordInputs[0], {
            target: { value: "password123" },
        })
        fireEvent.change(confirmPasswordInputs[0], {
            target: { value: "password123" },
        })

        // Call validateAndCheck directly
        await textFieldRef.current.validateAndCheck()

        // Expect onValuesChange to be called with the correct values
        expect(mockOnValuesChange).toHaveBeenCalledWith({
            password: "password123",
            confirmPassword: "password123",
        })
    })

    test("does not call onValuesChange when fields are empty", async () => {
        const mockOnValuesChange = jest.fn()
        render(
            <InputForms
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Leave fields empty and call validateAndCheck
        const textFieldRef = React.createRef()
        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        await textFieldRef.current.validateAndCheck()

        expect(mockOnValuesChange).not.toHaveBeenCalled()
    })

    test("shows mismatch error when passwords do not match", async () => {
        const mockOnValuesChange = jest.fn()
        render(
            <InputForms
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Fill in the fields with mismatched data
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        const confirmPasswordInputs =
            screen.getAllByLabelText(/Confirm Password/i)

        fireEvent.change(passwordInputs[0], {
            target: { value: "password123" },
        })
        fireEvent.change(confirmPasswordInputs[0], {
            target: { value: "differentPassword" },
        })

        // Call validateAndCheck
        const textFieldRef = React.createRef()
        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        await textFieldRef.current.validateAndCheck()

        // Check that onValuesChange is not called
        expect(mockOnValuesChange).not.toHaveBeenCalled()

        // Check for error message
        expect(
            await screen.findByText(/Passwords do not match/i)
        ).toBeInTheDocument()
    })

    test("shows minimum length error message", async () => {
        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        fireEvent.change(passwordInputs[0], { target: { value: "123" } })

        fireEvent.blur(passwordInputs[0])

        expect(
            await screen.findByText(/Minimum length is 6 characters/i)
        ).toBeInTheDocument()
    })

    test("shows mismatch error message when passwords do not match", async () => {
        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        const confirmPasswordInputs = screen.getAllByLabelText(/Password/i)
        // Fill in the password fields
        fireEvent.change(passwordInputs[0], {
            target: { value: "password123" },
        }) // Password
        fireEvent.change(confirmPasswordInputs[1], {
            target: { value: "password1234" },
        }) // Confirm Password

        fireEvent.blur(confirmPasswordInputs[1])

        expect(
            await screen.findByText(/Passwords do not match/i)
        ).toBeInTheDocument()
    })

    test("does not show mismatch error when passwords match", async () => {
        render(<InputForms config={mockConfig} onValuesChange={jest.fn()} />)

        const passwordInputs = screen.getAllByLabelText(/Password/i)

        // Fill in the password fields
        fireEvent.change(passwordInputs[0], {
            target: { value: "password123" },
        }) // Password
        fireEvent.change(passwordInputs[1], {
            target: { value: "password123" },
        }) // Confirm Password
        fireEvent.blur(passwordInputs[1])
        await waitFor(() => {
            expect(
                screen.queryByText(/Passwords do not match/i)
            ).not.toBeInTheDocument()
        })
    })

    test("toggles checkbox and calls onCheckboxChange", async () => {
        const mockOnCheckboxChange = jest.fn()

        // Mock the config object with checkboxText
        const mockConfig = {
            inputs: {
                password: {
                    id: 1,
                    name: "password",
                    label: "Password",
                    required: true,
                    placeholder: "Enter your password",
                    validationMessages: {
                        required: "Password is required",
                        mismatch: "Passwords do not match",
                    },
                    inputConfig: {
                        minLength: 6,
                    },
                },
                confirmPassword: {
                    id: 2,
                    name: "confirmPassword",
                    label: "Confirm Password",
                    required: true,
                    placeholder: "Confirm your password",
                    validationMessages: {
                        required: "Confirm Password is required",
                        mismatch: "Passwords do not match",
                    },
                    inputConfig: {
                        minLength: 6,
                    },
                },
            },
            checkboxText: {
                beforeText: "I agree to the ",
                hrefText: "terms and conditions",
            },
        }

        // Render InputForms with checkbox
        render(
            <InputForms
                config={mockConfig}
                onValuesChange={jest.fn()}
                onCheckboxChange={mockOnCheckboxChange}
            />
        )

        // Find the checkbox element
        const checkbox = screen.getByRole("checkbox")

        // Initially, checkbox should not be checked
        expect(checkbox).not.toBeChecked()

        // Simulate checking the checkbox
        fireEvent.click(checkbox)
        expect(checkbox).toBeChecked()
        expect(mockOnCheckboxChange).toHaveBeenCalledWith(true)

        // Simulate unchecking the checkbox
        fireEvent.click(checkbox)
        expect(checkbox).not.toBeChecked()
        expect(mockOnCheckboxChange).toHaveBeenCalledWith(false)
    })

    test("throws error message when passwords do not match", async () => {
        const mockOnValuesChange = jest.fn()
        const textFieldRef = createRef()

        // Render the InputForms component
        render(
            <InputForms
                ref={textFieldRef}
                config={mockConfig}
                onValuesChange={mockOnValuesChange}
            />
        )

        // Fill in the password fields with mismatched values
        const passwordInputs = screen.getAllByLabelText(/Password/i)
        const confirmPasswordInputs =
            screen.getAllByLabelText(/Confirm Password/i)

        fireEvent.change(passwordInputs[0], {
            target: { value: "password123" },
        })
        fireEvent.change(confirmPasswordInputs[0], {
            target: { value: "differentPassword" },
        })

        // Attempt to validate and check values
        await textFieldRef.current.validateAndCheck()

        // Expect the mismatch error message to be displayed
        expect(
            await screen.findByText(/Passwords do not match/i)
        ).toBeInTheDocument()

        // Ensure that onValuesChange is not called when passwords do not match
        expect(mockOnValuesChange).not.toHaveBeenCalled()
    })
})
