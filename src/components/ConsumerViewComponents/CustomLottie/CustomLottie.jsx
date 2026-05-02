import React from "react"
import { Button, Card, Flex } from "antd"
import Lottie from "lottie-react"
import styles from "./CustomLottie.module.scss"
import stylesVariable from "../../../styles/base/_stylesVariable.module.scss"

function CustomLottie({
    lottieData,
    messageText,
    subMessageText,
    buttonLabel,
    onClick,
}) {
    return (
        <Card bordered={false} className={styles.card}>
            <Flex justify="center">
                <div className={styles.lottieContainer}>
                    <Lottie animationData={lottieData} loop={true} />
                </div>
                <div className={styles.contentContainer}>
                    <div className={styles.messagetext}>{messageText}</div>
                    <div className={styles.messageSubtext}>
                        {subMessageText}
                    </div>
                    <div className={styles.buttonContainer}>
                        <Button
                            className={styles.btnOrder}
                            onClick={onClick}
                            style={{ width: stylesVariable.widthCentPercent }}
                        >
                            {buttonLabel}
                        </Button>
                    </div>
                </div>
            </Flex>
        </Card>
    )
}

export default CustomLottie
