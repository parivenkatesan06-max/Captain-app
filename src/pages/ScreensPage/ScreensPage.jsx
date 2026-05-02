import React, { useEffect, useState } from "react"
import { Layout, Flex, Typography } from "antd"
import { useQuery } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import PageHeader from "../../components/Header/Header"
import Breadcrumbs from "../../components/Breadcrumbs/Breadcurmbs"
import ApiUtil from "../../utility/ApiUtil/ApiUtil"
import ScreenWidget from "../../components/ScreenWidget/ScreenWidget"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import styles from "./ScreensPage.module.scss"
import labels from "./ScreensPage.label.json"
import EndPoints from "../../utility/EndPoints"
import { getUserInfo } from "../../utility/userInfo"
import ErrorPage from "../ErrorPage/ErrorPage"

function ScreensPage() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const navigate = useNavigate()
    const screenPageBreadcrumbs = [
        { title: labels?.breadcrumbScreens },
    ];    
    const [filteredScreens, setFilteredScreens] = useState([])
    
    const handleScreenClick = (screen) => {
        navigate("/screens/screens-info", {
            state: { entityCode: screen?.entityCode, screenName : screen?.entityName }
        });
    }
    
    const apiUtil = new ApiUtil()
    const userInfo = getUserInfo()
    const fetchScreenDetails = () => 
        apiUtil.get(
            `${EndPoints.clientEntity}?clientCode=${userInfo?.clientInfo?.clientCode}`
        );

    const {
        data: onLoadData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["fetchScreenDetails"],
        queryFn: fetchScreenDetails,
    })

    useEffect(() => {
        if (onLoadData?.data?.data) {
            setFilteredScreens(onLoadData?.data?.data)
        }
    }, [onLoadData?.data?.data])
    if (isLoading) {
        return <LoaderLottie />
    }

    if (isError) {
        return <ErrorPage/>;  
    }

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader />
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcrumbs items={screenPageBreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.pageTitle}</Title>
                </Flex>
                <Flex gap={8} className={styles.screenContainer}>
                    <Flex justify="center" gap="0.5rem" wrap>
                        {filteredScreens?.map((screen, index) => {
                            return (
                                <ScreenWidget
                                    onClick={() => handleScreenClick(screen)}
                                    screenNumber={screen?.entityName}
                                    key={screen?.entityId || index}
                                />
                            )
                        })}
                    </Flex>
                </Flex>
            </Content>
        </Layout>
    )
}

export default ScreensPage