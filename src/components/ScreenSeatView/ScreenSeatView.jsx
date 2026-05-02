import React from "react"
import styles from "./ScreenSeatView.module.scss"

const ScreenSeatView = ({ orderId, orderPlacedTime, seatNumber, onClick }) => {
    const seatLastTwoDigits = seatNumber.slice(-2);
    return (
        <div className={styles.container}>
            <div className={styles.seatContainer}>
                <span className={styles.seatnumber}>{seatLastTwoDigits}</span>
            </div>
            <div className={styles.textContainer}>
                <span className={styles.orderId}>{orderId}</span>
                <span className={styles.orderPlacedTime}>
                    {orderPlacedTime}
                </span>
            </div>
            <button className={styles.viewButton} onClick={onClick}>View</button>
        </div>
    )
}
export default ScreenSeatView
