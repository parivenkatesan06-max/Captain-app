import React, { useEffect, useState } from "react";
import { Card, Col, ConfigProvider, Flex, Menu, Modal, Radio, Row } from "antd";
import { useNavigate, useLocation } from "react-router-dom";
import styles from "./BottomNavBar.module.scss";
import { ReactComponent as CartIcon } from "../../../assets/Image/icons/Mobile-Cart.svg";
import { ReactComponent as HomeIcon } from "../../../assets/Image/icons/Mobile-Home.svg";
import { ReactComponent as MenuIcon } from "../../../assets/Image/icons/Mobile-Menu.svg";
import { ReactComponent as OrdersIcon } from "../../../assets/Image/icons/Mobile-Orders.svg";
import { ReactComponent as OffersIcon } from "../../../assets/Image/icons/Mobile-Offer.svg";
import { ReactComponent as CartIconEnable } from "../../../assets/Image/icons/Mobile-Cart-Enable.svg";
import { ReactComponent as HomeIconEnable } from "../../../assets/Image/icons/Mobile-Home-Enable.svg";
import { ReactComponent as MenuIconEnable } from "../../../assets/Image/icons/Mobile-Menu-Enable.svg";
import { ReactComponent as OrdersIconEnable } from "../../../assets/Image/icons/Mobile-Orders-Enable.svg";
import { ReactComponent as OffersIconEnable } from "../../../assets/Image/icons/Mobile-Offer-Enable.svg";
import { ArrowRightOutlined } from "@ant-design/icons";
import { useCart } from "../../../utility/CartUtils";
import designerPattern from "../../../styles/base/_variables.module.scss"
import stylesVariables from "../../../styles/base/_stylesVariable.module.scss"
import ConsumerButton from "../ConsumerButton/ConsumerButton";
import { useMutation } from "@tanstack/react-query";
import ApiUtil from "../../../utility/ApiUtil";
import EndPoints from "../../../utility/EndPoints";
import CustomMessage from "../../CustomMessage/CustomMessage";
import { loadRazorpayScript, getRazorpayOptions, openRazorpayModal } from "../../../utility/ApiUtil/razorpayUtils"; 
import { getUserInfo } from "../../../utility/userInfo";
import { ROLE_NAME } from "../../../utility/constants";
import Button from "../../Button/Button";
import paymentOptionsData from "./paymentOptions.json"

// eslint-disable-next-line complexity
const BottomNavBar = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { cartItems, grandTotal, setOrderReference } = useCart();
    const isCartScreen = location.pathname === "/consumer/cartscreen" || location.pathname === "/counter/cartscreen";
    const isMenuScreen = location.pathname === "/consumer/menuscreen" || location.pathname === "/counter/menuscreen";
    const orderApiUtil = new ApiUtil();
    const [isSuccessMessage, setIsSuccessMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const userInfo = getUserInfo();
    const [isModalVisible, setIsModalVisible] = useState(false)
    const [value, setValue] = useState("upi");
    const basePath = userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? "/counter" : "/consumer";
    const isCounterPath = location.pathname.includes("/counter");
    const [orderRefNum,setOrderRefNum] = useState("")
    // Map route paths to menu keys
    const routeToKeyMap = {
        "/consumer/homescreen": "home",
        "/consumer/menuscreen": "menu",
        "/consumer/cartscreen": "cart",
        "/consumer/ordersscreen": "orders",
        "/consumer/offersscreen": "offers",
    };

    const [current, setCurrent] = useState(
        routeToKeyMap[location.pathname] || "home"
    );

    useEffect(() => {
        setCurrent(routeToKeyMap[location.pathname] || "home");
    }, [location.pathname]);

    const triggerOrder = useMutation({
        mutationFn: (data) => orderApiUtil.post(EndPoints.order, data),
        onSuccess: (res) => {
            setIsSuccessMessage(true);
            setMessageContent("Order has been created successfully");
            if (res && res?.data?.data?.orderReferenceNumber) {
                setOrderReference(res?.data?.data?.orderReferenceNumber);
                const orderReferenceNumber = res?.data?.data?.orderReferenceNumber
                setOrderRefNum(orderReferenceNumber)
                if(userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN){
                    navigate(`${basePath}/ordersscreen`, { state: { successRefNum: orderReferenceNumber,paymentMethod:value, amountPaid:grandTotal } });
                } else{
                    const data = {
                        amount: parseFloat(grandTotal),
                        currency: "INR",
                    };
                    triggerRazorPayOrder.mutate({ data, orderReferenceNumber });
                }
            }
        },
        onError: (error) => {
            setIsSuccessMessage(true);
            setMessageContent(error?.response?.data?.errors[0].msg || "Invalid");
        },
    });
    const triggerRazorPayOrder = useMutation({
        mutationFn: ({ data }) => orderApiUtil.post(EndPoints.razCreatOrder, data), 
        onSuccess: (res, variables) => {
            if (res && res?.data?.data) {
                const razorpayOrderId = res?.data?.data?.order_id;
                const amount = res?.data?.data?.amount
                const razorpayOptions = getRazorpayOptions(
                    amount,
                    variables.orderReferenceNumber, 
                    razorpayOrderId,
                    triggerRazorPaySaveOrder
                );    
                openRazorpayModal(razorpayOptions, navigate);
            }
        },
        onError: (error) => {
            setIsSuccessMessage(true);
            setMessageContent(error?.response?.data?.errors[0].msg || "Invalid");
        },
    });
    const triggerRazorPaySaveOrder = useMutation({
        mutationFn: (data) => orderApiUtil.post(EndPoints.razSaveOrder, data),
        onSuccess: (res) => {
            if (res && res?.data?.success) {
                navigate(`${basePath}/ordersscreen`, { state: { successRefNum: orderRefNum,paymentMethod:value, amountPaid:grandTotal } });
            }
        },
        onError: (error) => {
            setIsSuccessMessage(true);
            setMessageContent(error?.response?.data?.errors[0].message || "Invalid");
            navigate(`${basePath}/ordersscreen`, { state: { successRefNum: orderRefNum,paymentMethod:value, amountPaid:grandTotal } });
        },
    });

    useEffect(() => {
        // Load Razorpay script when component mounts
        const loadScript = async () => {
            try {
                await loadRazorpayScript();
            } catch (error) {
                console.error("Failed to load Razorpay script:", error);
                // You might want to show a user-friendly error message here
                setIsSuccessMessage(true);
                setMessageContent("Payment system is currently unavailable. Please try again later.");
            }
        };

        // Only load script if we're not in counter path and user is not a client admin
        if (!isCounterPath && userInfo?.roleInfo?.roleName !== ROLE_NAME.CLIENT_ADMIN) {
            loadScript();
        }
    }, [isCounterPath, userInfo?.roleInfo?.roleName]);

    const handleClick = (e) => {
        const routes = {
            home: "/consumer/homescreen",
            menu: "/consumer/menuscreen",
            cart: "/consumer/cartscreen",
            orders: "/consumer/ordersscreen",
            offers: "/consumer/offersscreen",
        };

        setCurrent(e.key);
        navigate(routes[e.key] || "/");
    };

    // Helper function to select the icon based on the current selection
    const getIcon = (key, IconEnabled, IconDisabled) => (current === key ? <IconEnabled /> : <IconDisabled />);

    const renderCartButton = () => {
        const handleCartClick = () => {
            if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
                setIsModalVisible(true)
            } else {
                const order = cartItems.map((item) => ({
                    menuId: item.menuId,
                    quantity: item.quantity,
                }));
    
                // Construct the payload
                const payload = {
                    clientCode: userInfo?.clientInfo?.clientCode,
                    entityCode: userInfo?.clientInfo?.entityCode,
                    seatCode: userInfo?.seatCode,
                    paymentStatus: "pending",
                    orderStatus: "pending",
                    order,
                    paymentMethod: "upi",
                };
                triggerOrder.mutate(payload);
            }
        };
    
        return (
            <Flex justify="center" align="center" className={`${styles.continueButton} ${isCounterPath ? styles.counterMargin : ""}`}>
                <ConsumerButton
                    label="Continue"
                    type="primary"
                    style={{ width: stylesVariables.cartContinueBtnWidth, height: stylesVariables.cartContinueBtnHeight }}
                    onClick={handleCartClick}
                />
            </Flex>
        );
    };
    const handlePaymentDone = () =>{
        const order = cartItems.map((item) => ({
            menuId: item.menuId,
            quantity: item.quantity,
            price: parseFloat(item.price),
        }));
        // Construct the payload
        const payload = {
            clientCode: userInfo?.clientInfo?.clientCode,
            paymentStatus: "pending",
            orderStatus: "pending",
            order,
            paymentMethod: value,
            counterSale:1
        };
        // Trigger the order
        triggerOrder.mutate(payload);
    }
    const renderViewCartButton = () => (
        <Flex justify="space-between" align="center" className={styles.fullWidthButton}>
            <span className={styles.itemCount}>
                {`${cartItems.length} Item${cartItems.length > 1 ? "s" : ""} Added`}
            </span>
            <ConsumerButton
                type="link"
                style={{ color: designerPattern.tableBgColor, height: stylesVariables.viewCartBtnHeight , border:"none" }}
                icon={<ArrowRightOutlined />}
                iconPosition="end"
                onClick={() => navigate(`${basePath}/cartscreen`)}
                label="View Cart"
            />
        </Flex>
    );

    const renderBottomNavBar = () => {
        const menuItems = [
            {
                key: "home",
                label: "Home",
                icon: getIcon("home", HomeIconEnable, HomeIcon),
            },
            {
                key: "menu",
                label: "Menu",
                icon: getIcon("menu", MenuIconEnable, MenuIcon),
            },
            {
                key: "cart",
                label: "Cart",
                icon: getIcon("cart", CartIconEnable, CartIcon),
            },
            {
                key: "orders",
                label: "Orders",
                icon: getIcon("orders", OrdersIconEnable, OrdersIcon),
            },
            {
                key: "offers",
                label: "Offers",
                icon: getIcon("offers", OffersIconEnable, OffersIcon),
            },
        ];

        return (
            <Menu
                onClick={handleClick}
                selectedKeys={[current]}
                mode="horizontal"
                className={styles.bottomNavBar}
                items={menuItems}
            />
        );
    };
    const onChange = (e) => {
        setValue(e.target.value);
    };
      
    return (
        <>
            {cartItems.length > 0 && isCartScreen ? (
                <>
                    {renderCartButton()}
                    <Modal
                        title="Select Payment Method"
                        open={isModalVisible}
                        footer={
                            <div className={styles.modalFooter}>
                                <Button
                                    onClick={handlePaymentDone}
                                    label="Payment Done"
                                    type="primary"
                                />
                            </div>
                        } 
                        onCancel={() => setIsModalVisible(false)}
                    >
                        <ConfigProvider
                            theme={{
                                token: {
                                    colorPrimary: designerPattern.consumerButtonColor
                                },
                            }}
                        >
                            <Radio.Group className={styles.paymentOptions} value={value}>
                                {paymentOptionsData?.paymentOptions.map((option) => (
                                    <Card key={option.value} className={`${styles.paymentCard} ${value === option.value ? styles.selected : ""}`} hoverable  onClick={() => onChange({ target: { value: option.value } })}>
                                        <Row align="middle" justify="space-between" className={styles.paymentRow}>
                                            <Col>
                                                <Radio value={option.value} className={styles.radioLabel} />
                                                {option.label}
                                            </Col>
                                            <Col>
                                                <span className={styles.iconStyle}>
                                                    {React.createElement(require("@ant-design/icons")[option.icon])}
                                                </span>
                                            </Col>                                        
                                        </Row>
                                    </Card>
                                ))}
                            </Radio.Group>
                        </ConfigProvider>
                    </Modal>

                </>
            ) : (
                <div className={`${styles.bottomNavBarContainer} ${isCounterPath ? styles.counterMargin : ""}`}>
                    {cartItems.length > 0 && isMenuScreen && renderViewCartButton()}
                    {renderBottomNavBar()}
                </div>
            )}
            <CustomMessage
                isVisible={isSuccessMessage}
                type={"success"}
                content={messageContent}
                duration={3}
            />
        </>
    );
    
};

export default BottomNavBar;
