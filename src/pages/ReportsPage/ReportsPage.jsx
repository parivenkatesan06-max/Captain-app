import React, { useState, useEffect } from "react"
import { Layout, Flex, Typography, DatePicker, Select } from "antd"
import { CalendarOutlined } from "@ant-design/icons"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import labels from "./ReportsPage.label.json"
import CustomPieChart from "./Components/PieChart/CustomPieChart"
import ReportCard from "./Components/ReportCard/ReportCard"
import styles from "./ReportPage.module.scss"
import CustomLineChart from "./Components/CustomLineChart/CustomLineChart"
import dayjs from "dayjs"
import ApiUtil from "../../utility/ApiUtil"
import EndPoints from "../../utility/EndPoints"
import { useQuery } from "@tanstack/react-query"
import ErrorPage from "../ErrorPage/ErrorPage"
import { getUserInfo } from "../../utility/userInfo"
import Lottie from "lottie-react"
import loaderLottie from "../../assets/Lottie/loader-lottie.json"
import Button from "../../components/Button/Button"
import { Link } from "react-router-dom"
// Helper functions
const getOrdinalSuffix = (day) => {
    if (day > 3 && day < 21) return "th"
    switch (day % 10) {
    case 1:
        return "st"
    case 2:
        return "nd"
    case 3:
        return "rd"
    default:
        return "th"
    }
}

const formatWeekDisplay = (date, reportType) => {
    if (!date) return ""
    const startOfWeek = dayjs(date).startOf("week")
    const endOfWeek = dayjs(date).endOf("week")
    const startDay = startOfWeek.format("DD")
    const startMonth = startOfWeek.format("MMM")
    const endDay = endOfWeek.format("DD")
    const endMonth = endOfWeek.format("MMM")
    const periodType = reportType === "weekly" ? "Week" : "Month"
    return `${periodType} (${startDay}${getOrdinalSuffix(parseInt(startDay))} ${startMonth} - ${endDay}${getOrdinalSuffix(parseInt(endDay))} ${endMonth})`
}

// Format for displaying the selected date
const formatSelectedDate = (date) => {
    if (!date) return ""
    return dayjs(date).format("MMM DD, YYYY")
}

// Custom format that shows both the selected date and week range
const combinedFormat = (date, reportType) => {
    if (!date) return ""
    return `${formatSelectedDate(date)} - ${formatWeekDisplay(date, reportType)}`
}

const disabledDate = (current) => {
    return current && current > new Date()
}

// Report content component
const ReportContent = ({ data, labels, reportType }) => {
    const [frequencyPeriodType, setFrequencyPeriodType] = useState("Week")
    
    // Update frequencyPeriodType based on report type
    useEffect(() => {
        if (reportType) {
            setFrequencyPeriodType(reportType === "weekly" ? "Week" : "Month")
        }
    }, [reportType])
    
    return (
        <Flex className={styles.reportContainer}>
            <div className={styles.reportCardsContainer}>
                {data?.metrics?.totalProfit && (
                    <ReportCard
                        data={data?.metrics?.totalProfit}
                        label={labels?.totalProfitLabel}
                    />
                )}
                {data?.metrics?.totalOrders && (
                    <ReportCard
                        data={data?.metrics?.totalOrders}
                        label={labels?.totalOrderLabel}
                    />
                )}
                {data?.metrics?.salesGrowth && (
                    <ReportCard
                        data={data?.metrics?.salesGrowth}
                        label={labels?.salesGrowthLabel}
                    />
                )}
                {data?.metrics?.cancelOrders && (
                    <ReportCard
                        data={data?.metrics?.cancelOrders}
                        label={labels?.cancelOrderLabel}
                    />
                )}
                <CustomLineChart data={data?.metrics?.salesChart} frequency={frequencyPeriodType}/>
            </div>
            <Flex vertical wrap gap={20} className={styles.pieContainer}>
                <CustomPieChart
                    semicircle={false}
                    data={data?.metrics?.revenueBreakdown}
                    label={labels?.revenueLabel}
                    percentage={
                        data?.metrics?.revenueBreakdown?.comparison?.value
                    }
                />
            </Flex>
        </Flex>
    )
}

// Extract the form section into a separate component
const ReportForm = ({ 
    selectedClient, 
    setSelectedClient, 
    reportType, 
    setReportType, 
    selectedDate, 
    handleDateChange, 
    handleSubmit,
    onLoadDataClient 
}) => {
    const { Option } = Select;
    
    return (
        <Flex align="flex-end" gap={8}>
            <Flex vertical gap={16}>
                <Select
                    className={styles.clientSelect}
                    placeholder="Select Client Name"
                    value={selectedClient}
                    onChange={(value) => {
                        setSelectedClient(value);
                    }}>
                    {onLoadDataClient?.data?.data?.map((client) => (
                        <Option key={client?.name} value={client?.clientCode}>
                            {client?.name}
                        </Option>
                    ))}
                </Select>
                <Select
                    value={reportType}
                    onChange={(value) => setReportType(value)}
                    className={styles.reportTypeSelect}
                    options={[
                        { value: "weekly", label: "Weekly" },
                        { value: "monthly", label: "Monthly" }
                    ]}
                />
                <DatePicker
                    picker={reportType}
                    onChange={handleDateChange}
                    value={selectedDate ? dayjs(selectedDate) : null}
                    placeholder={`Select ${reportType}`}
                    className={styles.datePicker}
                    disabledDate={disabledDate}
                    format={(date) => combinedFormat(date, reportType)}
                    prefixIcon={<CalendarOutlined />}
                />
                <Button
                    type="primary"
                    className={styles.submitBtn}
                    iconPosition="end"
                    label="Submit"
                    onClick={handleSubmit}
                />
            </Flex>
        </Flex>
    );
};

function ReportsPage() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const [selectedDate, setSelectedDate] = useState(null)
    const [reportType, setReportType] = useState("weekly")
    const [isWeekChangeLoading, setIsWeekChangeLoading] = useState(false)
    const [showReport, setShowReport] = useState(false)
    const userInfo = getUserInfo()
    const [selectedClient, setSelectedClient] = useState(null);
    const [shouldFetch, setShouldFetch] = useState(false);
    const [breadcrumbs, setBreadcrumbs] = useState([
        {
            title: "Reports",
        },
    ]);

    const reportPageApiUtil = new ApiUtil()
    const getAllReports = () => {
        if (!selectedDate) {
            return Promise.resolve(null)
        }
        return reportPageApiUtil.get(
            `${EndPoints.getAllReports}?clientCode=${selectedClient}&selectedDate=${dayjs(selectedDate).format("YYYY-MM-DD")}&frequency=${reportType}`
        )
    }
    const {
        data: onLoadData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["getAllReports", selectedDate, selectedClient, reportType, shouldFetch],
        queryFn: getAllReports,
        enabled: shouldFetch,
    })
    const getClient = () =>
        reportPageApiUtil.get(`${EndPoints.client}/${userInfo?.clientInfo?.clientGroupCode}`);

    const { data: onLoadDataClient } = useQuery({
        queryKey: ["getEntity"],
        queryFn: getClient,
    });

    useEffect(() => {
        if (onLoadData?.data?.data) {
            setShowReport(true)
            setIsWeekChangeLoading(false)
            setBreadcrumbs([
                {
                    title: <Link to={"/reports"} onClick={handleReportsClick}>Reports</Link>,
                },
                {
                    title: "Summary",
                },
            ]);
        }
    }, [onLoadData])

    if (isError) {
        return <ErrorPage />
    }

    const handleDateChange = (date) => {
        setSelectedDate(date ? date.toDate() : null)
    }

    const getClientName = () => {
        if (!selectedDate) return labels?.pageTitle;
        if (!selectedClient || !onLoadDataClient?.data?.data) return labels?.pageTitle;
        const client = onLoadDataClient.data.data.find(client => client.clientCode === selectedClient);
        return client ? `${labels?.pageTitle} - ${client.name}` : labels?.pageTitle;
    };

    const handleSubmit = () => {
        if (selectedDate && selectedClient) {
            setShouldFetch(true);
        }
    };

    const handleReportsClick = () => {
        setShowReport(false);
        setBreadcrumbs([
            {
                title: "Reports",
            },
        ]);
        // Reset all form fields
        setSelectedClient(null);
        setReportType("weekly");
        setSelectedDate(null);
        setShouldFetch(false);
    };

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader />
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={breadcrumbs} separator=">" />
                    <Flex
                        justify="space-between"
                        align="center"
                        style={{ marginBottom: "24px" }}
                    >
                        <Title level={2}>{getClientName()}</Title>
                    </Flex>
                </Flex>
                {isLoading || isWeekChangeLoading ? (
                    <Lottie
                        animationData={loaderLottie}
                        loop={true}
                        className={styles.lottieContainer}
                    />
                ) : showReport ? (
                    <ReportContent
                        data={onLoadData?.data?.data}
                        labels={labels}
                        reportType={reportType}
                    />
                ) : (
                    <ReportForm 
                        selectedClient={selectedClient}
                        setSelectedClient={setSelectedClient}
                        reportType={reportType}
                        setReportType={setReportType}
                        selectedDate={selectedDate}
                        handleDateChange={handleDateChange}
                        handleSubmit={handleSubmit}
                        onLoadDataClient={onLoadDataClient}
                    />
                )}
            </Content>
        </Layout>
    )
}

export default ReportsPage
