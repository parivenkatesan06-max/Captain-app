import React from "react"
import styles from "./ReportCard.module.scss"
import profitIcon from "../../../../assets/Image/icons/profit.png"
const ReportCard = ({ data, label }) => {
    const isPositive = data?.comparison?.direction === "positive"
    const formattedValue = data?.comparison?.value ? Number(data.comparison.value).toFixed(2) : "0.00"

    return (
        <div className={styles.mainContainer}>
            <div className={styles.contentContainer}>
                <div className={styles.headContainer}>
                    <div className={styles.iconSize}>
                        <img src={profitIcon} alt="profit-icon" />
                    </div>
                    <div
                        className={
                            isPositive
                                ? styles.percentageContainerGreen
                                : styles.percentageContainerRed
                        }
                    >
                        {formattedValue.includes(".")
                            ? `${parseFloat(formattedValue).toFixed(2)}%`
                            : `${formattedValue}%`}
                    </div>
                </div>
                <div className={styles.bodyContainer}>
                    <div className={styles.totalContainer}>
                        <h5 className={styles.bodyTotalTitle}>{label}</h5>
                        <h5 className={styles.bodyTotalAmount}>
                            {data?.value && data.value.toString().includes(".")
                                ? parseFloat(data.value).toFixed(2)
                                : data?.value}
                        </h5>
                    </div>
                    <div className={styles.bodyTimeContainer}>
                        <h5 className={styles.bodyTimePeriod}>
                            {data?.comparison?.period}
                        </h5>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ReportCard
