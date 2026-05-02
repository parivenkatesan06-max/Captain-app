import React, { useState, useMemo } from "react"
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from "recharts"
import calender from "../../../../assets/Image/icons/calender.svg"
import styles from "./CustomLineChart.module.scss"
import { Select } from "antd"

// Custom Legend Component
const CustomLegend = ({ payload }) => {
    return (
        <div className={styles.legendContainer}>
            {payload.map((entry, index) => (
                <div key={`item-${index}`} className={styles.legendItem}>
                    <div
                        className={styles.legendDot}
                        style={{ backgroundColor: entry.color }}
                    ></div>
                    <span className={styles.legendText}>
                        {entry.value.charAt(0).toUpperCase() + entry.value.slice(1)}
                    </span>
                </div>
            ))}
        </div>
    )
}

const CustomLineChart = ({ data, frequency }) => {
    const [selectedWeek, setSelectedWeek] = useState("")

    // Function to handle week change from the dropdown
    const handleWeekChange = (value) => {
        setSelectedWeek(value)
    }

    // Transform the data into the format required by the chart
    const transformedData = useMemo(() => {
        if (!data?.labels || !data?.datasets) return []

        return data?.labels.map((label, index) => ({
            date: label,
            income: data?.datasets[0]?.data[index]
        }))
    }, [data])

    // Set default selected week to the date range if it's not already set
    const defaultWeek = data?.dateRange || ""

    return (
        <div className={styles.container}>
            {/* Dropdown Selector */}
            <div className={styles.dropdownContainer}>
                <div className={styles.title}>{data?.title || "Sales Chart"}</div>
                <div className={styles.dropdown}>
                    <img
                        src={calender}
                        alt="Calendar"
                        className={styles.calendarIcon}
                    />
                    {frequency}
                    <Select
                        value={selectedWeek || defaultWeek}
                        onChange={handleWeekChange}
                        className={styles.weekLabel}
                    >
                        <Select.Option value={defaultWeek}>
                            ({defaultWeek})
                        </Select.Option>
                    </Select>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <BarChart
                    width={1000}
                    height={400}
                    data={transformedData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 10 }}
                >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis
                        domain={[100000, "auto"]}
                        tickFormatter={(value) => `${value / 1000}k`}
                    />
                    <Tooltip />
                    <Legend
                        content={<CustomLegend />}
                        layout="horizontal"
                        verticalAlign="top"
                        justifyContent="start"
                    />
                    <Bar
                        dataKey="income"
                        fill="#D87500"
                        barSize={16}
                        radius={[15, 15, 15, 15]}
                    />
                </BarChart>
            </ResponsiveContainer>
        </div>
    )
}

export default CustomLineChart
