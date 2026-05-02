import React from "react"
import "./StatusLegends.scss"
import { Flex } from "antd"
import { TABLE_BOOKING_STATUS, TABLE_BOOKING_STATUS_COLOR } from "../../utility/constants"
const statuses = [
    {
        label: "Served",
        color: TABLE_BOOKING_STATUS_COLOR[TABLE_BOOKING_STATUS.SERVED],
    },
    {
        label: "Payment Pending",
        color: TABLE_BOOKING_STATUS_COLOR[TABLE_BOOKING_STATUS.PAYMENT_PENDING],
    },
    {
        label: "Paid",
        color: TABLE_BOOKING_STATUS_COLOR[TABLE_BOOKING_STATUS.PAID],
    },
   
]

const StatusLegends = () => {
    return (
        <Flex justify="center" align="center" className="status-indicator">
            {statuses.map((status, index) => (
                <div key={index} className="status-item">
                    <span
                        className="status-dot"
                        style={{ backgroundColor: status.color }}
                    ></span>
                    <span className="status-label">{status.label}</span>
                </div>
            ))}
        </Flex>
    )
}

export default StatusLegends
