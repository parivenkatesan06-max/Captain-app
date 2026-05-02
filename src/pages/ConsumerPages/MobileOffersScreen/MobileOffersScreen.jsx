import React, { useEffect, useState } from "react"
import CustomLottie from "../../../components/ConsumerViewComponents/CustomLottie/CustomLottie"
import offerUnlockLottie from "../../../assets/Lottie/offer-unlock-lottie.json"
import ConsumerHeader from "../../../components/ConsumerViewComponents/ConsumerHeader/ConsumerHeader"
import { Flex } from "antd"
import { useNavigate } from "react-router-dom"
import styles from "./MobileOffersScreen.module.scss"
import ApiUtil from "../../../utility/ApiUtil"
import EndPoints from "../../../utility/EndPoints"
import { getUserInfo } from "../../../utility/userInfo"
import { useQuery } from "@tanstack/react-query"
const MobileOffersScreen = () => {
    const navigate = useNavigate()
    const menuApiUtil = new ApiUtil()
    const userInfo = getUserInfo()
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
    }, [clientData, userInfo?.clientInfo?.clientCode]);    return (
        <div  className={styles.container}>
            <ConsumerHeader cartText="Offers" itemsCountText="" clientLogo={clientLogo}/>
            <Flex justify="center">
                <CustomLottie
                    lottieData={offerUnlockLottie}
                    messageText="Your offer is on the way!"
                    subMessageText="Exciting offers coming soon!"
                    buttonLabel="Order Now"
                    onClick={() => {
                        navigate("/consumer/menuscreen")
                    }}
                />
            </Flex>
        </div>
    )
}

export default MobileOffersScreen
