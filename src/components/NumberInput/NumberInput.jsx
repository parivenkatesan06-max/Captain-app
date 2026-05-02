import React, { useEffect } from "react"
import { PlusOutlined, MinusOutlined } from "@ant-design/icons"
import styles from "./NumberInput.module.scss"
import { InputNumber } from "antd"

const NumberInput = ({ count, increment, decrement, onChange,  bgColor, textColor,style }) => {
    useEffect(() => {
        // Update the CSS variables when the bgColor or textColor props change
        document.documentElement.style.setProperty(
            "--numberInput-bg-color",
            bgColor
        )
        document.documentElement.style.setProperty(
            "--numberInput-text-color",
            textColor
        )
    }, [bgColor, textColor])
    const handleKeyPress = (e) => {
        if (e.key === "." || e.key === ",") {
            e.preventDefault();
        }
    };

    return (
        <div className={styles.counterButton} style={style}>
            <button type="button" onClick={decrement} className={styles.iconButton}>
                <MinusOutlined />
            </button>
            <InputNumber
                value={count}
                onChange={onChange}
                controls={false}
                type="number"
                className={styles.inputNumber}
                precision={0}
                onKeyDown={handleKeyPress}
            />
            <button type="button" onClick={increment} className={styles.iconButton}>
                <PlusOutlined />
            </button>
        </div>
    )
}

export default NumberInput
