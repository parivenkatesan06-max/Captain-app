import React from "react"
import { Modal } from "antd"
import styles from "./ModalContent.module.scss"
import Button from "../Button/Button"

const ModalContent = (props) => {
    const {
        primaryButtonLabel,
        secondaryButtonLabel,
        primaryOnClick,
        secondaryOnClick,
        content,
    } = props
    const renderFooter = () =>
        React.Children.toArray([
            <Button
                key={primaryButtonLabel}
                onClick={primaryOnClick}
                label={primaryButtonLabel}
            />,
            <Button
                key={secondaryButtonLabel}
                type="primary"
                onClick={secondaryOnClick}
                label={secondaryButtonLabel}
            />,
        ])

    return (
        <Modal {...props} footer={renderFooter} className={styles.modalStyle}>
            {content}
        </Modal>
    )
}

export default ModalContent
