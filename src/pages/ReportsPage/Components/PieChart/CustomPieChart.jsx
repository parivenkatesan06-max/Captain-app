import React, { useMemo } from "react"
import { Cell, PieChart, Pie, Tooltip, ResponsiveContainer } from "recharts"
import styles from "./CustomPieChart.module.scss"

// Color palette
const COLORS = [
    "#007DB2",
    "#D8CF00",
    "#D87500",
    "#aeefc8",
    "#86deaa",
    "#73c897",
    "#9180cc",
    "#c1aff6",
    "#cadad8",
    "#9bb4b1",
    "#7ea4a8",
]

// Constants
const RADIAN = Math.PI / 180
const textStyles = {
    fontWeight: "bold",
    fontSize: "14px",
}

// Custom label rendering
const RenderCustomizedLabel = (props) => {
    const iRadius = Number(props.innerRadius) || 0
    const oRadius = Number(props.outerRadius) || 0
    const mAngle = Number(props.midAngle) || 0
    const chartX = Number(props.cx) || 0
    const chartY = Number(props.cy) || 0
    const percentage = Number(props.percent) || 0

    const radius = oRadius + (iRadius - oRadius) * 0
    const x = chartX + radius * Math.cos(-mAngle * RADIAN)
    const y = chartY + radius * Math.sin(-mAngle * RADIAN)

    const circleRadius = 20

    return (
        <g>
            <circle cx={x} cy={y} r={circleRadius} fill="#F7F8FA" />
            <text
                x={x}
                y={y}
                fill="black"
                textAnchor="middle"
                dominantBaseline="central"
                style={textStyles}
            >
                {`${(percentage * 100).toFixed(0)}%`}
            </text>
        </g>
    )
}

// Custom Tooltip component
const CustomPieChart = ({ semicircle, data, label, percentage }) => {
    const formattedValue = percentage ? Number(percentage).toFixed(2) : "0.00"
    const CustomizedTooltip = useMemo(() => {
        const TooltipComponent = (props) => {
            if (props.payload.length > 0) {
                const data = props.payload[0]
                return (
                    <div className={styles.customizedTooltip}>
                        <p>{data.name}</p>
                        <p>{data.value}</p>
                    </div>
                )
            }
            return null
        }

        TooltipComponent.displayName = "CustomizedTooltip"
        return TooltipComponent
    }, [])

    // Apply cornerRadius conditionally for semicircle
    const cornerRadius = semicircle ? 10 : 0
    const padRadius = semicircle ? 80 : 0
    const isPositive = data?.comparison?.direction === "positive"

    return (
        <ResponsiveContainer
            width={400}
            height={470}
            className={styles.pieChartContainer}
            aspect={1}
        >
            <div className={styles.header}>
                {label?.heading}
            </div>
            <div className={styles.subHeader}>{label?.subHeading}</div>
            <PieChart style={{ width: "400px", height: "296px" }}>
                <Tooltip content={<CustomizedTooltip />} />
                <Pie
                    dataKey="value"
                    data={data?.segments}
                    cx={200}
                    cy={182}
                    labelLine={false}
                    label={RenderCustomizedLabel}
                    innerRadius={90}
                    outerRadius={130}
                    startAngle={semicircle ? 0 : 0}
                    endAngle={semicircle ? 180 : 360}
                    cornerRadius={cornerRadius}
                    padRadius={padRadius}
                >
                    {data?.segments?.map((_entry, index) => (
                        <Cell
                            fill={COLORS[index % COLORS.length]}
                            key={`cell-${index}`}
                        />
                    ))}
                </Pie>
                {/* Add the "Hi" text here */}
                <text
                    className={styles.chartText}
                    x={200}
                    y={180}
                    textAnchor="middle"
                    dominantBaseline="middle"
                >
                    Compared to last week
                </text>
                <g>
                    {/* Background rectangle */}
                    <rect
                        className={styles.backgroundRect}
                        fill={isPositive ? "#02B602" : "#FF3B30"}
                    />
                    {/* Text */}
                    <text
                        x={200}
                        y={220}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        className={styles.textPercentage}
                    >
                        {`${formattedValue}%`}
                    </text>
                </g>
            </PieChart>
            <div className={styles.legendContainer}>
                {data?.segments?.map((entry, index) => (
                    <div key={index} className={styles.legendItem}>
                        <span className={styles.legendText}>
                            <div
                                className={styles.legendDot}
                                style={{
                                    backgroundColor:
                                        COLORS[index % COLORS.length],
                                }}
                            />
                            {entry?.label}
                        </span>
                        <span className={styles.legendText}>
                            ₹{entry.value}
                        </span>
                    </div>
                ))}
            </div>
        </ResponsiveContainer>
    )
}

export default CustomPieChart
