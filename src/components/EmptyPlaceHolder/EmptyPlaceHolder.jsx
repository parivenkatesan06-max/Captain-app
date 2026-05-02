import React from "react"
import styles from "./EmptyPlaceHolder.module.scss"
import { Button } from "antd"
const EmptyPlaceHolder = ({ icon, text, onClick, disabled, onDrop, onDragOver }) => {

   

    return (
        <div onDrop={onDrop} onDragOver={onDragOver}>
            <Button
                type="button" 
                className={styles.dashedButton}
                onClick={disabled ? null : onClick}
                aria-label={text} 
            >
                <div className={styles.iconContainer}>{icon}</div>
                <span className={styles.buttonText}>{text}</span>
            </Button>
        </div>
    )
}

export default EmptyPlaceHolder
