import React from "react"
import styles from "./AddMenuEmptyPlaceHolder.module.scss"
import { Button } from "antd"
const AddMenuEmptyPlaceHolder = ({ icon, text, onClick, disabled }) => {
 
    
    return (
        <Button
            type="button" 
            className={styles.dashedEmptyButton}
            onClick={disabled ? null : onClick}
            aria-label={text} 
        >
            <div className={styles.iconEmptyContainer}>{icon}</div>
            <span className={styles.buttonEmptyText}>{text}</span>
        </Button>
    )
}

export default AddMenuEmptyPlaceHolder
