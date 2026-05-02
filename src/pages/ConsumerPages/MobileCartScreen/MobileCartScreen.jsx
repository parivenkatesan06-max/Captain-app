import React, { useEffect, useState } from "react"
import ProductCard from "../../../components/ConsumerViewComponents/ProductCard/ProductCard"
import styles from "./MobileCartScreen.module.scss"
import { Divider, Flex, Layout, Typography } from "antd"
import { PlusCircleFilled } from "@ant-design/icons"
import { useCart } from "../../../utility/CartUtils"
import CustomLottie from "../../../components/ConsumerViewComponents/CustomLottie/CustomLottie"
import orderLottie from "../../../assets/Lottie/order-lottie.json"
import ConsumerHeader from "../../../components/ConsumerViewComponents/ConsumerHeader/ConsumerHeader"
import { useNavigate } from "react-router-dom"
import stylesVariable from "../../../styles/base/_stylesVariable.module.scss"
import designerPattern from "../../../styles/base/_variables.module.scss"
import ConsumerButton from "../../../components/ConsumerViewComponents/ConsumerButton/ConsumerButton";
import { getUserInfo } from "../../../utility/userInfo"
import { ROLE_NAME } from "../../../utility/constants"
import { useQuery } from "@tanstack/react-query"
import ApiUtil from "../../../utility/ApiUtil"
import EndPoints from "../../../utility/EndPoints"

const menuApiUtil = new ApiUtil()

const MobileCartScreen = () => {
    const { cartItems, totalItems, totalPrice, cgstAmount, sgstAmount,grandTotal,cgstRate,sgstRate } = useCart()
    const { Title } = Typography
    const navigate = useNavigate()
    const userInfo = getUserInfo();
    const basePath = userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? "/counter" : "/consumer";
    const [clientLogo,setClientLogo] = useState("")

    const { data: clientData } = useQuery({
        queryKey: ["clientLogo", userInfo?.clientInfo?.clientCode],
        queryFn: () => {
            const extractedClientCode = userInfo?.clientInfo?.clientCode?.split("-")[0];
            return menuApiUtil.get(`${EndPoints.client}/${extractedClientCode}`);
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
        <>
            <div className={styles.container}>
                <ConsumerHeader cartText="Your Cart" clientLogo={clientLogo}/>
                {cartItems && cartItems.length > 0 ? (
                    <>
                        <div className={styles.productContainer}>
                            <ProductCard isEdit={true} />
                        </div>
                        <Flex
                            justify="space-between"
                            align="center"
                            className={styles.addMore}
                        >
                            <Title
                                level={5}
                                style={{ padding: stylesVariable.zeroPX, margin: stylesVariable.zeroPX }}
                            >
                                Missed something?
                            </Title>
                            <ConsumerButton
                                label="Add More"
                                icon={
                                    <PlusCircleFilled
                                        className={styles.addmoreIcon}
                                    />
                                }
                                iconPosition="end"
                                onClick={() => {
                                    navigate(`${basePath}/menuscreen`)
                                }}
                            />
                        </Flex>
                        <div className={styles.orderSummary}>
                            <h2 className={styles.title}>Order Summary</h2>
                            <div className={styles.summaryContent}>
                                <Flex
                                    justify="space-between"
                                    className={styles.row}
                                >
                                    <span>Items ({totalItems})</span>
                                    <span>₹{totalPrice?.toFixed(2)}</span>
                                </Flex>
                                <Flex
                                    justify="space-between"
                                    className={styles.row}
                                >
                                    <span>
                                        CGST ({(cgstRate * 100).toFixed(0)}%)
                                    </span>
                                    <span>₹{cgstAmount?.toFixed(2)}</span>
                                </Flex>
                                <Flex
                                    justify="space-between"
                                    className={styles.row}
                                >
                                    <span>
                                        SGST ({(sgstRate * 100).toFixed(0)}%)
                                    </span>
                                    <span>₹{sgstAmount?.toFixed(2)}</span>
                                </Flex>
                                <Divider
                                    variant="dashed"
                                    style={{ borderColor: designerPattern.textPrimary }}
                                    dashed
                                />
                                <Flex
                                    justify="space-between"
                                    className={styles.totalRow}
                                >
                                    <span className={styles.totalLabel}>
                                        Total
                                    </span>
                                    <span className={styles.totalValue}>
                                        ₹{grandTotal}
                                    </span>
                                </Flex>
                            </div>
                        </div>
                    </>
                ) : (
                    <Flex justify="center" align="center">
                        <CustomLottie
                            lottieData={orderLottie}
                            messageText="Your cart is empty"
                            subMessageText="Looks like you've got nothing in your cart!"
                            buttonLabel="Order Now"
                            onClick={() => {
                                navigate(`${basePath}/menuscreen`)
                            }}
                        />
                    </Flex>
                )}
            </div>
        </>
    )
    return userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? (
        <Layout className="layoutWrapper">{mainContent}</Layout>
    ) : (
        mainContent
    );
}

export default MobileCartScreen
