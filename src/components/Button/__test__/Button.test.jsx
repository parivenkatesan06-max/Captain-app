// import React from "react";
// import { render, screen } from "@testing-library/react";
// import Button from "../Button";

// // Mock the themeProvider module
// jest.mock("../../utility/themeProvider", () => require("../../../../test/mocks/themeProviderMock").mockThemeProvider());

// describe("Button Component", () => {
//     test("renders the button with the correct label", () => {
//         render(<Button label="Click Me" />);
//         const buttonElement = screen.getByRole("button", { name: /click me/i });
//         expect(buttonElement).toBeInTheDocument();
//     });

//     test("passes other props to the AntButton", () => {
//         render(<Button label="Test" type="primary" disabled />);
//         const buttonElement = screen.getByRole("button", { name: /test/i });
//         expect(buttonElement).toBeDisabled();
//         expect(buttonElement).toHaveClass("ant-btn-primary");
//     });

//     test("applies the buttonBase class", () => {
//         render(<Button label="Styled" />);
//         const buttonElement = screen.getByRole("button", { name: /styled/i });
//         expect(buttonElement).toHaveClass("buttonBase");
//     });
// });