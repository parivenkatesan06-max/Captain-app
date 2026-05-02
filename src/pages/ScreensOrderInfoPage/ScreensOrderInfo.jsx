import React, { useEffect, useRef, useState } from "react"
import { Layout, Typography, Result, Drawer, Table, Flex, Pagination, ConfigProvider } from "antd"
import { PrinterOutlined } from "@ant-design/icons"
import { Link, useLocation } from "react-router-dom"
import PageHeader from "../../components/Header/Header"
import Breadcrumbs from "../../components/Breadcrumbs/Breadcurmbs"
import ScreenSeatView from "../../components/ScreenSeatView/ScreenSeatView"
import ApiUtil from "../../utility/ApiUtil"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import labels from "./ScreensOrderInfo.label.json"
import styles from "./ScreensOrderInfo.module.scss"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import Button from "../../components/Button/Button"
import { getUserInfo } from "../../utility/userInfo"
import printLabel from "../../assets/Labels/print.labes.json"
import EndPoints from "../../utility/EndPoints"
import { calculateTax } from "../../utility/calculationMapper"
import designPatterns from "../../styles/base/_variables.module.scss"
import ErrorPage from "../ErrorPage/ErrorPage"
import { useMutation } from "@tanstack/react-query"

function ScreensOrderInfo() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const userInfo = getUserInfo()
    const screenPageBreadcrumbs = [
        { title: <Link to={"/screens"}>{labels?.breadcrumbs?.screens}</Link> },
        { title: labels?.breadcrumbs?.screenList },
    ]
    const printRef = useRef(null)
    const [open, setOpen] = useState(false)
    const [screenSeatList, setScreenSeatList] = useState([])

    const [orderDetails, setOrderDetails] = useState(null)
    const [total, setTotal] = useState({ total: 0, subtotal: 0 })
    const location = useLocation();
    const { entityCode, screenName } = location.state || {};
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(true);
    const [isError, setIsError] = useState(false)
    const hasFetched = useRef(false);
    const [clientInfo, setClientInfo] = useState(
        {
            "name": "",
            "address": "",
            "phone_no": "",
            "email": "",
            "gstin": "",
            "logo_url": ""
        }
    );
    // Show the drawer and set selected seat
    const showDrawer = (seat) => {
        setOpen(true);
        setOrderDetails(seat);
    
        const totalItems = seat?.orders.reduce(
            (total, item) => total + item.quantity,
            0
        ) || 0;
    
        const subtotal = seat?.orders.reduce(
            (total, item) => total + item.offerPrice * item.quantity,
            0
        ) || 0;
    
        setTotal({ total: totalItems, subtotal: subtotal });

    };
    

    const onClose = () => {
        setOpen(false)
    }
    const screenOrderApiUtil = new ApiUtil()


    // Fetch screen order data based on the current page
    const fetchOrders = async (page = 1) => {
        setLoading(true);
        try {
            const response = await screenOrderApiUtil.get(
                `${EndPoints.order}?entityCode=${entityCode}&page=${page}&itemsPerPage=20`
            );
            const orders = response?.data?.data || [];
            setScreenSeatList(orders);
            triggerClient.mutate(userInfo?.clientInfo?.clientGroupCode)
            // Determine if there are more pages based on the length of the response
            if (orders.length === 20) {
                setTotalPages(page + 1);  // More pages available
            } else {
                setTotalPages(page);  // Last page
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
            setIsError(true)
        } finally {
            setLoading(false);
        }
    };
    function getClientLogo(clientCode) {
        return screenOrderApiUtil.get(
            `${EndPoints.client}/${clientCode}`
        );
    }

    const triggerClient = useMutation({
        mutationFn: (clientCode) => getClientLogo(clientCode),
        onSuccess: (data) => {
            const clientInfo = data?.data?.data
            const specificClient = Array.isArray(clientInfo) 
                ? clientInfo.find(client => client.clientCode === userInfo?.clientInfo?.clientCode)
                : clientInfo;
        
            if (specificClient?.logo_url) {
                setClientInfo({
                    name: specificClient?.name,
                    address: specificClient?.address,
                    phone_no: specificClient?.phone_no,
                    email: specificClient?.email,
                    gstin: specificClient?.gstin,
                    logo_url: specificClient?.logo_url
                })        
            }
        },
        onError: (error) =>{
            console.log(error,"error")
        }
    })
    useEffect(() => {
        if (entityCode && !hasFetched.current) {
            hasFetched.current = true; // Mark as fetched
            fetchOrders(currentPage);
        }
    }, [entityCode, fetchOrders, currentPage]);
    // Pagination handler
    const handlePageChange = (page) => {
        setCurrentPage(page);
        fetchOrders(page);
    };

    if (loading) {
        return <LoaderLottie />
    }

    if (isError) {
        return (
            <ErrorPage/>
        )
    }

    const columns = [
        {
            title: labels?.orderDetails?.category,
            dataIndex: "menuName",
            key: "category",
        },
        {
            title: labels?.orderDetails?.quantity,
            dataIndex: "quantity",
            key: "quantity",
        },
        {
            title: labels?.orderDetails?.price,
            dataIndex: "offerPrice",
            key: "offerPrice",
            render: (price) => `₹${price}`,
        },
    ]

    const { cgst, sgst, grandTotal } = calculateTax(total.subtotal, "India")

    const handlePrint = () => {
        const element = document.getElementById("printContent")
        const companyDetails = document.getElementById("companyDetails")
        const orderDetails = document.getElementById("orderID")
        const invoiceDetails = document.getElementById("invoiceDetails")
        const logoImg = companyDetails?.querySelector("img")

        if (orderDetails) {
            orderDetails.style.display = "none"
        }
        if (companyDetails) {
            companyDetails.style.display = "block"
        }
        if (invoiceDetails) {
            invoiceDetails.style.display = "block"
        }

        // Wait for logo to load before capturing
        const captureContent = () => {
            html2canvas(element, {
                scale: 2,
                letterRendering: true,
                useCORS: true, // Enable CORS for images
                allowTaint: true // Allow cross-origin images
            }).then((canvas) => {
                const imgData = canvas.toDataURL("image/png")

                const thermalPrinterWidth = 80 // Total paper width in mm
                const leftRightMargin = 10 // Left and right margin in mm
                const topBottomMargin = 10 // Top and bottom margin in mm
                const contentWidth = thermalPrinterWidth - 2 * leftRightMargin // Content width after applying margins

                const dpi = 96 // 96 DPI for typical web content
                const contentWidthInPixels = (contentWidth / 25.4) * dpi // Convert mm to pixels
                const aspectRatio = canvas.width / canvas.height
                const contentHeightInPixels = contentWidthInPixels / aspectRatio // Calculate proportional height
                const contentHeightInMm = (contentHeightInPixels / dpi) * 25.4 // Convert back to mm

                const pageHeight = contentHeightInMm + 2 * topBottomMargin

                const doc = new jsPDF({
                    orientation: "p",
                    unit: "mm",
                    format: [thermalPrinterWidth, pageHeight],
                })

                doc.addImage(
                    imgData,
                    "PNG",
                    leftRightMargin,
                    topBottomMargin,
                    contentWidth,
                    contentHeightInMm
                )

                // Trigger print dialog
                doc.autoPrint()
                window.open(doc.output("bloburl"), "_blank")

                if (companyDetails) {
                    companyDetails.style.display = "none"
                }
                if (invoiceDetails) {
                    invoiceDetails.style.display = "none"
                }
                if (orderDetails) {
                    orderDetails.style.display = "block"
                }
            })
        }

        if (logoImg && clientInfo?.logo_url) {
            // If logo exists and has a source, wait for it to load
            if (logoImg.complete) {
                captureContent()
            } else {
                logoImg.onload = captureContent
            }
        } else {
            // If no logo, proceed with capture
            captureContent()
        }
    }

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader />
            </Header>
            <Content className="contentWrapper">
                <div style={{ padding: stylesVariable.oneRem }}>
                    <Breadcrumbs items={screenPageBreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.screenInfoTitle}</Title>
                </div>
                <div className={styles.orderContainer}>
                    {screenSeatList.length > 0 ? (
                        <><Flex
                            wrap
                            gap={16}
                            style={{
                                padding: stylesVariable.oneRem,
                            }}
                        >
                            {screenSeatList.map((seat) => (
                                <ScreenSeatView
                                    onClick={() => showDrawer(seat)}
                                    key={`${seat?.orders?.[0]?.orderId}-${seat?.seatCode}`}
                                    orderId={seat?.displayOrderReferenceNumber}
                                    orderPlacedTime={seat?.orderCreatedTime}
                                    seatNumber={seat?.seatCode} />
                            ))}
                        </Flex>
                        <ConfigProvider
                            theme={{
                                cssVar: true,
                                components: {
                                    Pagination: {
                                        colorPrimaryBorder: designPatterns.buttonPrimary,
                                        colorPrimaryHover:designPatterns.buttonPrimary,
                                        colorText: designPatterns.iconColor,
                                        colorPrimary: designPatterns.buttonPrimary,
                                    },
                                }
                            }}
                        >
                            <Pagination
                                current={currentPage}
                                total={totalPages * 20}
                                pageSize={20}
                                onChange={handlePageChange}
                                showSizeChanger={false}
                                showQuickJumper={false}
                                align="end"
                                style={{
                                    textAlign: "right",
                                    marginTop: "20px",
                                }} />
                        </ConfigProvider>
                        </>
                    ) : (
                        <Result
                            className="layoutWrapper"
                            status="404"
                            title={labels?.noDataAvailable}
                            subTitle={`No order details available for screen ${screenName}.`}
                        />
                    )}
                    <Drawer
                        title={labels?.orderDetails.title}
                        onClose={onClose}
                        open={open}
                    >
                        {orderDetails ? (
                            <>
                                <div id="printContent" ref={printRef}>
                                    {/* Conditional Company Details Section */}
                                    <div
                                        id="companyDetails"
                                        className={styles.companyDetails}
                                    >
                                        <img src={clientInfo?.logo_url} alt="logo" className={styles.logoImage} />
                                        <div className={styles.clientName}>
                                            {clientInfo?.name}
                                        </div>
                                        <div className={styles.address}>
                                            {clientInfo?.address}
                                        </div>
                                        <div className={styles.contactInfo}>
                                            {clientInfo?.phone_no} | {clientInfo?.email}
                                        </div>
                                        <div className={styles.clientName}>
                                            {printLabel.heading}
                                        </div>
                                    </div>
                                    <div
                                        id="invoiceDetails"
                                        className={styles.invoiceContainer}
                                    >
                                        <Flex justify="space-between">
                                            <div>{printLabel?.invoiceName}:</div>
                                            <div>{clientInfo?.name}</div>
                                        </Flex>

                                        <Flex justify="space-between">
                                            <div>{printLabel?.invoiceGst}:</div>
                                            <div>{clientInfo?.gstin}</div>
                                        </Flex>

                                        <Flex justify="space-between">
                                            <div>{printLabel?.invoiceDate}:</div>
                                            <div>{orderDetails?.orderCreatedTime}</div>
                                        </Flex>

                                        <Flex justify="space-between">
                                            <div>{printLabel?.invoiceInfo}:</div>
                                            <div>{orderDetails?.orders?.[0]?.orderId}</div>
                                        </Flex>

                                        <Flex justify="space-between">
                                            <div>{printLabel?.invoiceGSTNo}:</div>
                                            <div>{orderDetails?.orders?.[0]?.orderId}</div>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <div>{printLabel?.seatNumber}:</div>
                                            <div>{orderDetails?.seatCode !== "null" ? orderDetails?.seatCode.slice(-2) : "Counter Sale Order"}</div>
                                        </Flex>
                                    </div>
                                    {/* Order Details Section */}
                                    <Flex
                                        id="orderID"
                                        justify="flex-start"
                                        align="center"
                                        style={{
                                            marginBottom: stylesVariable.oneRem,
                                        }}
                                    >
                                        <Flex
                                            justify="center"
                                            align="center"
                                            className={styles.identifier}
                                        >
                                            {orderDetails?.seatCode.slice(-2)}
                                        </Flex>
                                        <Flex
                                            gap={8}
                                            vertical
                                            style={{
                                                fontSize: stylesVariable.oneRem,
                                                padding: stylesVariable.oneRem,
                                                fontWeight: 600,
                                            }}
                                        >
                                            {orderDetails?.displayOrderReferenceNumber}
                                            <div
                                                style={{
                                                    fontSize:
                                                        stylesVariable.screensFontSize,
                                                }}
                                            >
                                                {orderDetails?.orderCreatedTime}
                                            </div>
                                        </Flex>
                                    </Flex>
                                    <div className={styles.orderTableWrapper}>
                                        <Table
                                            columns={columns}
                                            dataSource={
                                                orderDetails?.orders
                                            }
                                            pagination={false}
                                        />
                                    </div>
                                    <Flex
                                        gap={16}
                                        vertical
                                        className={styles.orderSummary}
                                    >
                                        <Flex justify="space-between">
                                            <div>
                                                {labels?.orderSummary?.items}:
                                            </div>
                                            <div>{total?.total}</div>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <div>
                                                {labels?.orderSummary?.subtotal}
                                                :
                                            </div>
                                            <div>{`₹${total?.subtotal.toFixed(2)}`}</div>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <div>
                                                {labels?.orderSummary?.cgst}:
                                            </div>
                                            <div>{`₹${cgst.toFixed(2)}`}</div>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <div>
                                                {labels?.orderSummary?.sgst}:
                                            </div>
                                            <div>{`₹${sgst.toFixed(2)}`}</div>
                                        </Flex>
                                        <Flex justify="space-between">
                                            <div>
                                                {labels?.orderSummary?.total}:
                                            </div>
                                            <div>{`₹${grandTotal.toFixed(2)}`}</div>
                                        </Flex>
                                    </Flex>
                                </div>

                                <Flex
                                    justify="center"
                                    className={styles.printButtonWrapper}
                                >
                                    <Button
                                        type="primary"
                                        onClick={handlePrint}
                                        className={styles.printButton}
                                        icon={<PrinterOutlined />}
                                        iconPosition="end"
                                        label={labels?.printButton}
                                        style={{ width: stylesVariable.printBtnWidth }}
                                    />
                                </Flex>
                            </>
                        ) : (
                            <Result
                                status="404"
                                title={labels?.noOrderDetails}
                                subTitle={labels?.noOrderDetailsSubTitle}
                            />
                        )}
                    </Drawer>
                </div>
            </Content>
        </Layout>
    )
}

export default ScreensOrderInfo
