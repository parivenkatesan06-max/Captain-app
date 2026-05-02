import React, { useEffect, useState,useRef } from "react"
import CustomLottie from "../../../components/ConsumerViewComponents/CustomLottie/CustomLottie"
import orderLottie from "../../../assets/Lottie/order-lottie.json"
import styles from "./MobileOrderScreen.module.scss"
import ProductCard from "../../../components/ConsumerViewComponents/ProductCard/ProductCard"
import { Col, Divider, Flex, Layout, Modal, Row } from "antd"
import ConsumerHeader from "../../../components/ConsumerViewComponents/ConsumerHeader/ConsumerHeader"
import { useLocation, useNavigate } from "react-router-dom"
import { useMutation, useQuery } from "@tanstack/react-query"
import ApiUtil from "../../../utility/ApiUtil"
import EndPoints from "../../../utility/EndPoints"
import { useCart } from "../../../utility/CartUtils"
import { getUserInfo } from "../../../utility/userInfo"
import successLottie from "../../../assets/Lottie/success-lottie.json"
import { ROLE_NAME } from "../../../utility/constants"
import designerPattern from "../../../styles/base/_variables.module.scss"
import { calculateTax } from "../../../utility/calculationMapper"


const MobileOrdersScreen = () => {
    const navigate = useNavigate()
    const [cartItems,setCartItems] = useState([])
    const userInfo = getUserInfo();   
    const location = useLocation();  
    const orderRefNumber = location.state?.successRefNum;
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [paymentMethod,setPaymentMethod] = useState("")
    const [amountPaid,setAmountPaid] = useState("")
    const hasFetched = useRef(false);
    const orderApiUtil = new ApiUtil()
    const basePath = userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? "/counter" : "/consumer";
    const { clearCart } = useCart()
    const [orderSummary, setOrderSummary] = useState({
        cgst: 0,
        sgst: 0,
        totalPrice: 0,
        grandTotal: 0
    })  
    const [clientLogo,setClientLogo] = useState("")
    // Function to get stored orders
    const getStoredOrders = () => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) return [];
        const storedOrders = sessionStorage.getItem("orderHistory");
        return storedOrders ? JSON.parse(storedOrders) : [];
    };

    // Function to get stored order summary
    const getStoredOrderSummary = () => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
            return {
                cgst: 0,
                sgst: 0,
                totalPrice: 0,
                grandTotal: 0
            };
        }
        const storedSummary = sessionStorage.getItem("orderSummary");
        return storedSummary ? JSON.parse(storedSummary) : {
            cgst: 0,
            sgst: 0,
            totalPrice: 0,
            grandTotal: 0
        };
    };

    // Function to store orders
    const storeOrders = (orders) => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) return;
        const existingOrders = getStoredOrders();
        const updatedOrders = [...existingOrders, ...orders];
        sessionStorage.setItem("orderHistory", JSON.stringify(updatedOrders));
    };

    // Function to store order summary
    const storeOrderSummary = (summary) => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) return;
        const existingSummary = getStoredOrderSummary();
        const updatedSummary = {
            cgst: existingSummary.cgst + summary.cgst,
            sgst: existingSummary.sgst + summary.sgst,
            totalPrice: existingSummary.totalPrice + summary.totalPrice,
            grandTotal: existingSummary.grandTotal + summary.grandTotal
        };
        sessionStorage.setItem("orderSummary", JSON.stringify(updatedSummary));
    };

    const triggerGetOrder = useMutation({
        mutationFn: (orderReferenceNumber) => {
            const baseUrl = `${EndPoints.order}?orderReferenceNumber=${orderReferenceNumber}`;
            
            const url = userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN
                ? `${baseUrl}&clientCode=${userInfo?.clientInfo?.clientCode}`
                : `${baseUrl}&entityCode=${userInfo?.clientInfo?.entityCode}`;
            
            return orderApiUtil.get(url);
        },
        onSuccess: (response) => {
            if (!response?.data?.data?.[0]?.orders) {
                return;
            }

            const data = response.data.data[0].orders;
            const { cgst, sgst, grandTotal } = calculateTax(response.data.data[0].totalOfferPrice, "India");
            const newOrderSummary = {
                cgst: cgst,
                sgst: sgst,
                grandTotal: grandTotal,
                totalPrice: response.data.data[0].totalOfferPrice
            };
            
            // Store the new order data and update summary only for consumer
            if (userInfo?.roleInfo?.roleName !== ROLE_NAME.CLIENT_ADMIN) {
                storeOrders(data);
                storeOrderSummary(newOrderSummary);
                setCartItems(getStoredOrders());
                setOrderSummary(getStoredOrderSummary());
            } else {
                // For counter path, directly set the data
                setCartItems(data);
                setOrderSummary(newOrderSummary);
            }
            
            setIsModalVisible(true);
            clearCart();
        },
        onError: (error) => {
            console.log("Order API error:", error);
        },
    });

    useEffect(() => {

        if (orderRefNumber && !hasFetched.current) {
            hasFetched.current = true;
            triggerGetOrder.mutate(orderRefNumber);
            setPaymentMethod(location.state?.paymentMethod);
            setAmountPaid(location.state?.amountPaid);
        } else if (!orderRefNumber && !hasFetched.current) {
            hasFetched.current = true;
            // If no new order, load existing orders from sessionStorage for consumer
            // or show empty state for counter
            if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
                setCartItems([]);
                setOrderSummary({
                    cgst: 0,
                    sgst: 0,
                    totalPrice: 0,
                    grandTotal: 0
                });
            } else {
                setCartItems(getStoredOrders());
                setOrderSummary(getStoredOrderSummary());
            }
        }
    }, [orderRefNumber]); // Removed userInfo?.roleInfo?.roleName from dependencies

    const storedSeatCode = localStorage.getItem("seatCode");
    const storedClientCode = localStorage.getItem("clientCode");
    const storedEntityCode = localStorage.getItem("entityCode");
    const handleHome =()=>{
        {userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ?
            navigate("/counter/menuscreen") :
            navigate({
                pathname: "/consumer/homescreen",
                search: `?clientCode=${storedClientCode}&entityCode=${storedEntityCode}&seatCode=${storedSeatCode}`
            })
        }
    }
    const { data: clientData } = useQuery({
        queryKey: ["clientLogo", userInfo?.clientInfo?.clientCode],
        queryFn: () => {
            const extractedClientCode = userInfo?.clientInfo?.clientCode?.split("-")[0];
            return orderApiUtil.get(`${EndPoints.client}/${extractedClientCode}`);
        },
        enabled: !!userInfo?.clientInfo?.clientCode,
        staleTime: Infinity,
        onError: (error) => {
            console.error("Failed to fetch client logo:", error);
        }
    });

    useEffect(() => {
        if (clientData?.data?.data) {
            const clientInfo = clientData.data.data;
            const specificClient = Array.isArray(clientInfo) 
                ? clientInfo.find(client => client.clientCode === userInfo?.clientInfo?.clientCode)
                : clientInfo;

            if (specificClient?.logo_url) {
                setClientLogo(specificClient.logo_url);
            }
        }
    }, [clientData, userInfo?.clientInfo?.clientCode]);
    const mainContent = (  
        <div className={styles.container}>
            <ConsumerHeader
                cartText="Your Order"
                itemsCountText={`${cartItems?.length} Items Ordered`}
                clientLogo={clientLogo}
            />
            {cartItems && cartItems?.length > 0 ? (
                <><div className={styles.productContainer}>
                    <Modal
                        title=""
                        open={isModalVisible}
                        onCancel={() => setIsModalVisible(false)}
                        footer=""
                    >
                        <Flex justify="center" align="center">
                            <CustomLottie
                                lottieData={successLottie}
                                messageText="Payment Done"
                                buttonLabel="Go To Home"
                                onClick={handleHome} />
                        </Flex>
                        <Row style={{ marginBottom: "10px" }}>
                            <Col span={12}><strong>Payment Type:</strong></Col>
                            <Col span={12} style={{ textAlign: "right" }}>{paymentMethod.toUpperCase()}</Col>
                        </Row>
                        <Row style={{ marginBottom: "10px" }}>
                            <Col span={12}><strong>Amount Paid:</strong></Col>
                            <Col span={12} style={{ textAlign: "right" }}>₹ {amountPaid}</Col>
                        </Row>
                        <Row>
                            <Col span={12}><strong>Transaction Id:</strong></Col>
                            <Col span={12} style={{ textAlign: "right" }}>{orderRefNumber}</Col>
                        </Row>
                    </Modal>

                    <ProductCard isEdit={false} orderItems={cartItems} />
                </div>
                <div className={styles.orderSummary}>
                    <h2 className={styles.title}>Order Summary</h2>
                    <div className={styles.summaryContent}>
                        <Flex
                            justify="space-between"
                            className={styles.row}
                        >
                            <span>Items ({cartItems?.length})</span>
                            <span>₹{orderSummary?.totalPrice?.toFixed(2)}</span>
                        </Flex>
                        <Flex
                            justify="space-between"
                            className={styles.row}
                        >
                            <span>
                                    CGST ({(0.09 * 100).toFixed(0)}%)
                            </span>
                            <span>₹{orderSummary?.cgst.toFixed(2)}</span>
                        </Flex>
                        <Flex
                            justify="space-between"
                            className={styles.row}
                        >
                            <span>
                                    SGST ({(0.09 * 100).toFixed(0)}%)
                            </span>
                            <span>₹{orderSummary?.sgst.toFixed(2)}</span>
                        </Flex>
                        <Divider
                            variant="dashed"
                            style={{ borderColor: designerPattern.textPrimary }}
                            dashed />
                        <Flex
                            justify="space-between"
                            className={styles.totalRow}
                        >
                            <span className={styles.totalLabel}>
                                    Total Amount Paid
                            </span>
                            <span className={styles.totalValue}>
                                    ₹{orderSummary?.grandTotal.toFixed(2)}
                            </span>
                        </Flex>
                    </div>
                </div></>
            ) : (
                <Flex justify="center" align="center">
                    <CustomLottie
                        lottieData={orderLottie}
                        messageText="Your order history is empty"
                        subMessageText="Looks like you've got nothing in your order!"
                        buttonLabel="Order Now"
                        onClick={() => {
                            navigate(`${basePath}/menuscreen`)
                        }}
                    />
                </Flex>
            )}
        </div>
    )
    return userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? (
        <Layout className="layoutWrapper">{mainContent}</Layout>
    ) : (
        mainContent
    );
}

export default MobileOrdersScreen
