import React from "react"
import { Card } from "antd"
import styles from "./MenuTable.module.scss"
import { Flex } from "antd"
import {
    TABLE_BOOKING_STATUS_COLOR,
    TABLE_BOOKING_STATUS,
} from "../../utility/constants"
import designPatterns from "../../styles/base/_variables.module.scss"

const TableLine = ({ position, color }) => (
    <div
        className={`${styles.tableLine} ${styles[`${position}Line`]}`}
        style={{ backgroundColor: color }}
    ></div>
)

const MenuTable = ({
    tableNumber,
    price,
    tableStatus,
    onClick,
    currency
}) => {

    const color = TABLE_BOOKING_STATUS_COLOR[tableStatus]

    const cardContent =
        tableStatus !== TABLE_BOOKING_STATUS.NOT_OCCUPIED ? (
            <div className={styles.cardText}>
                <p
                    className={styles.cardNumber}
                    style={{ color: designPatterns.textSecondary }}
                >
                    {tableNumber}
                </p>
                <p
                    className={styles.cardPrice}
                    style={{ color: designPatterns.textSecondary }}
                >
                    {`${currency} ${price}`}
                </p>
            </div>
        ) : (
            <p className={styles.cardNotOccupied}>Not occupied</p>
        )

    return (
        <div className={styles.tableCardContainer}>
            <Flex justify="space-around">
                <TableLine position="top" color={color} />
                <TableLine position="top" color={color} />
            </Flex>
            <Card
                className={styles.cardContainer}
                onClick={onClick}
                hoverable
                role="button"
                tabIndex={0}
                style={{
                    backgroundColor: color
                }}
            >
                {cardContent}
            </Card>
            <Flex justify="space-around">
                <TableLine position="bottom" color={color} />
                <TableLine position="bottom" color={color} />
            </Flex>
        </div>
    )
}

export default MenuTable
