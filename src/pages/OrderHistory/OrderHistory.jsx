import React, { useEffect, useRef, useState } from "react"
import { Layout, Flex, Typography, Table, ConfigProvider, Pagination, Result, Skeleton, Drawer, Select } from "antd"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import labels from "./OrderHistory.labels.json"
import designPatterns from "../../styles/base/_variables.module.scss"
import ApiUtil from "../../utility/ApiUtil"
import EndPoints from "../../utility/EndPoints"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import { EyeOutlined, PrinterOutlined } from "@ant-design/icons"
import Button from "../../components/Button/Button"
import Logo from "../../components/Logo/Logo"
import { getUserInfo } from "../../utility/userInfo"
import styles from "./OrderHistory.module.scss"
import printLabel from "../../assets/Labels/print.labes.json"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import { calculateTax } from "../../utility/calculationMapper"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"
import { useMutation, useQuery } from "@tanstack/react-query"


// eslint-disable-next-line complexity
function OrderHistory() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const screenOrderApiUtil = new ApiUtil()
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false); 
    const [orderList, setOrderList] = useState([])
    const [loadingDrawer, setLoadingDrawer] = useState(false)
    const [open, setOpen] = useState(false)
    const [orderDetails, setOrderDetails] = useState(null)
    const printRef = useRef(null)
    const [total, setTotal] = useState({ total: 0, subtotal: 0 })
    const tablePagebreadcrumbs = [
        {
            title: labels?.userListLabel
        }
    ]
    const userInfo = getUserInfo()
    const { Option } = Select;
    const [selectedEntity, setSelectedEntity] = useState(null);
    const [isSubmitted,setIsSubmitted] = useState(false);
    const [clientInfo, setClientInfo] = useState({
        name: "",
        address: "",
        phone_no: "",
        email: "",
        gstin: "",
        logo_url: ""
    })

    const hasTriggered = useRef(false);

    const getEntity = () =>
        screenOrderApiUtil.get(`${EndPoints.clientEntity}?clientCode=${userInfo?.clientInfo?.clientCode}`);

    const { data: onLoadDataEntity } = useQuery({
        queryKey: ["getEntity"],
        queryFn: getEntity,
    });
    
    const fetchOrders = async (page) => {
        setLoading(true);
        try {
            // Check if counter sale is selected (value === "1")
            const url = selectedEntity === "1" 
                ? `${EndPoints.order}?counterSale=1&page=${page}&itemsPerPage=20&clientCode=${userInfo?.clientInfo?.clientCode}`
                : `${EndPoints.order}?entityCode=${selectedEntity}&page=${page}&itemsPerPage=20`;

            const response = await screenOrderApiUtil.get(url);
            const orders = response?.data?.data || [];
            setOrderList(orders);

            // Determine if there are more pages based on the length of the response
            if (orders.length === 20) {
                setTotalPages(page + 1);  // More pages available
            } else {
                setTotalPages(page);  // Last page
            }
        } catch (error) {
            console.error("Error fetching orders:", error);
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
        if (!hasTriggered.current && userInfo?.clientInfo?.clientGroupCode) {
            triggerClient.mutate(userInfo?.clientInfo?.clientGroupCode);
            hasTriggered.current = true;
        }
    }, [userInfo?.clientInfo?.clientGroupCode, triggerClient]);

    // Call fetchOrders when currentPage changes
    useEffect(() => {
        if (isSubmitted) {
            fetchOrders(currentPage);
        }
    }, [isSubmitted, currentPage]);

    const showDrawer = (seat) => {
        setOpen(true);
        setLoadingDrawer(true);
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
        setTimeout(() => {
            setLoadingDrawer(false);
        }, 2000);
    };

    const columns = [
        {
            title: "Order ID",
            dataIndex: "orderId",
            align: "center",
            render: (text, record) => {
                // Check if orders array exists and has items
                if (record.orders && record.orders.length > 0) {
                    // Return the orderId from the first order in the array
                    return record.orders[0].orderId;
                }
                return text; // Fallback to the original text if orders array is empty
            },
        },
        {
            title: "Order Reference Number",
            dataIndex: "displayOrderReferenceNumber",
            align: "center",
            render: (text) => text,
        },
        {
            title: "Price",
            dataIndex: "totalOfferPrice",
            align: "center",
            render: (text, record) => {
                const subtotal = record?.orders?.reduce(
                    (total, item) => total + item.offerPrice * item.quantity,
                    0
                ) || 0;
                const { grandTotal } = calculateTax(subtotal, "India");
                return `₹${grandTotal.toFixed(2)}`;
            },
        },
        {
            title: "Payment Method",
            dataIndex: "paymentMethod",
            align: "center",
            render: (text) => text,
        },
        {
            title: "View",
            key: "actions",
            align: "center",
            render: (text, record) => (
                <Flex justify="center" gap="1.25rem">
                    <EyeOutlined
                        onClick={() => showDrawer(record)}
                        className={styles.eyeIcon}
                    />
                </Flex>
            ),
        },
    ]
    const onClose = () => {
        setOpen(false)
    }

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
    const columnsData = [
        {
            title: labels?.orderDetails?.menuName,
            dataIndex: "menuName",
            key: "category",
            align: "center",
        },
        {
            title: labels?.orderDetails?.quantity,
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
        },
        {
            title: labels?.orderDetails?.price,
            dataIndex: "offerPrice",
            key: "offerPrice",
            render: (price) => `₹${price}`,
            align: "center",
        },
    ]
    const handleSubmit = () => {
        if (selectedEntity) {
            setIsSubmitted(true);
        }
            
    };
    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>

                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={tablePagebreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.userListLabel}</Title>
                </Flex>
                <Flex gap={16} style={{ marginBottom: "16px" }}>
                    <Select
                        style={{ width: 200, height: 40 }}
                        placeholder="Select Screen"
                        value={selectedEntity}
                        onChange={(value) => {
                            setSelectedEntity(value);
                            setIsSubmitted(false);
                        }}>
                        <Option key="counter" value="1">Counter Sale</Option>
                        {onLoadDataEntity?.data?.data?.map((entity) => (
                            <Option key={entity.entityCode} value={entity.entityCode}>
                                {entity.entityName}
                            </Option>
                        ))}
                    </Select>
                    <Button
                        onClick={handleSubmit}
                        label="Submit"
                        type="primary"
                        disabled={!selectedEntity}
                    />
                </Flex>
                {loading ? (<LoaderLottie/>) : 
                    isSubmitted ? (
                        <>
                            <Table
                                bordered
                                borderColor={designPatterns.buttonPrimary}
                                dataSource={orderList.map((item) => ({ ...item, key: item.orderId }))}
                                columns={columns}
                                pagination={false}
                                scroll={{ y: 450 }}
                                locale={{
                                    emptyText: (
                                        <Flex justify="center" align="center" style={{ padding: "20px" }}>
                                            <Result
                                                status="404"
                                                title="No Data Found"
                                                subTitle="No orders are available for this Screen."
                                            />
                                        </Flex>
                                    ),
                                }} />
                            {orderList.length > 0 && (
                                <ConfigProvider
                                    theme={{
                                        cssVar: true,
                                        components: {
                                            Pagination: {
                                                colorPrimaryBorder: designPatterns.buttonPrimary,
                                                colorPrimaryHover: designPatterns.buttonPrimary,
                                                colorText: designPatterns.iconColor,
                                                colorPrimary: designPatterns.buttonPrimary,
                                            },
                                        },
                                    }}
                                >
                                    <Pagination
                                        current={currentPage}
                                        total={totalPages * 20}
                                        pageSize={20}
                                        showSizeChanger={false}
                                        showQuickJumper={false}
                                        align="end"
                                        style={{
                                            textAlign: "right",
                                            marginTop: "20px",
                                        }}
                                        onChange={(page) => {
                                            setCurrentPage(page);
                                        }}
                                    />
                                </ConfigProvider>
                            )}
                        </>
                    ) : (
                        <div>Please select a Screen and submit to view orders.</div>
                    )}
                <Drawer
                    title={labels?.orderDetails.title}
                    onClose={onClose}
                    open={open}
                >
                    {loadingDrawer ? (
                        <Skeleton active />
                    ) : orderDetails ? (
                        <>
                            <div id="printContent" ref={printRef}>
                                {/* Conditional Company Details Section */}
                                <div
                                    id="companyDetails"
                                    className={styles.companyDetails}
                                >
                                    <Logo className={styles.logoImage} />
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
                                        {printLabel?.heading}
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
                                        <div>{orderDetails?.seatCode !== "null" ? orderDetails?.seatCode?.slice(-2) : "Counter Sale Order"}</div>
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
                                    {selectedEntity !== "1" && (
                                        <Flex
                                            justify="center"
                                            align="center"
                                            className={styles.identifier}
                                        >
                                            {orderDetails?.seatCode?.slice(-2)}
                                        </Flex>
                                    )}
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
                                        columns={columnsData}
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
            </Content>
        </Layout>
    )
}

export default OrderHistory
