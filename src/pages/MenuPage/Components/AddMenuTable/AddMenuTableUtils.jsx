// AddMenuTableUtils.jsx
import React from "react"
import { Button } from "antd"

export const CustomInputNumber = ({ value, onChange }) => {
    return (
        <div style={{ display: "flex", alignItems: "center" }}>
            <Button
                onClick={() => onChange(Math.max(1, value - 1))}
                style={{ marginRight: 8 }}
            >
                -
            </Button>
            <span style={{ marginRight: 8 }}>{value}</span>
            <Button onClick={() => onChange(value + 1)}>+</Button>
        </div>
    )
}

export const CustomFileInput = ({ onChange, id }) => (
    <input
        type="file"
        id={id}
        accept="image/*"
        onChange={onChange}
        style={{ display: "none" }} // Hide the file input
        onClick={(e) => {
            e.target.value = null // Reset the input value to allow re-uploading the same file
        }}
    />
)
