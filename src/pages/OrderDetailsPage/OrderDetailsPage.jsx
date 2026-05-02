import React, { useEffect, useState } from "react"
import { Layout, Flex, Typography } from "antd"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import { Link, useNavigate, useParams } from "react-router-dom"
import ApiUtil from "../../utility/ApiUtil"
import { useMutation, useQuery } from "@tanstack/react-query"
import {
    LogoutOutlined,
    PrinterOutlined,
} from "@ant-design/icons"
import OrderTableView from "../../components/OrderTableView/OrderTableView"
import Button from "../../components/Button/Button"
import RoleButton from "../../components/RolebasedLogout/RoleDropdown"
import endPoints from "../../utility/EndPoints"
import CaptainHeader from "../../components/Header/CaptainHeader"
import { ROLES } from "../../utility/constants"
import { getUserInfo, resetUserInfo } from "../../utility/userInfo"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import labels from "./OrderDetailsPage.label.json";
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import ErrorPage from "../ErrorPage/ErrorPage"

function OrderDetailsPage() {
    const userInfo = getUserInfo();
    const navigate = useNavigate();

    const { Header, Content } = Layout
    const { Title } = Typography
    const tablePagebreadcrumbs = [
        {
            title: <Link to={"/table"}>{labels?.breadcrumbTable}</Link>,
        },
        {
            title: labels?.breadcrumbMenu,
        },
    ]
    const { tableId } = useParams()
    // const navigate = useNavigate()

    const orderDetailsApiUtil = new ApiUtil()
    const [orderList, setOrderList] = useState([])

    function getOrderdetails() {
        return orderDetailsApiUtil.get(`/table-status/${tableId}/order-details`)
    }

    let {
        data: onLoadData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["getOrderdetails"],
        queryFn: getOrderdetails,
    })
    const logoutApiUtil = new ApiUtil()

    const logoutValidation = async () => {
        const accessToken = sessionStorage.getItem("access_token")
        return logoutApiUtil.post(endPoints.logout, {
            token: accessToken,
        })
    }

    const triggerLogout = useMutation({
        mutationFn: logoutValidation,
        onSuccess: () => {
            resetUserInfo()
            navigate("/login")
        },
    })

    useEffect(() => {
        if (onLoadData?.data?.data) {
            setOrderList(onLoadData?.data?.data?.orderDetails)
        }
    }, [onLoadData])

    if (isLoading) {
        return (
            <LoaderLottie />
        )
    }

    if (isError) {
        
        return <ErrorPage />; 
    }

    return (
        <Layout className={userInfo.role !== ROLES.CAPTAIN ? "layoutWrapper" : ""}>
            {userInfo.role !== ROLES.CAPTAIN ? (
                <Header className="pageHeaderWrapper">
                    <PageHeader>
                        <Button
                            label={labels?.printButtonLabel}
                            icon={<PrinterOutlined />}
                            iconPosition="end"
                            type="primary"
                            size="large"
                        />
                    </PageHeader>
                </Header>
            ) : (
                <CaptainHeader title={labels?.pageTitle}>
                    <Flex gap={11}>
                        <RoleButton userInfo={userInfo} />
                        <Button
                            label={labels?.logoutButtonLabel}
                            icon={<LogoutOutlined />}
                            iconPosition="end"
                            type="primary"
                            size="large"
                            style={{ height: stylesVariable.logoutBtnHeight }}
                            onClick={() => triggerLogout.mutate()}
                        />
                    </Flex>
                </CaptainHeader>
            )}
            <Content className="contentWrapper">
                {userInfo.role !== ROLES.CAPTAIN && (
                    <Flex vertical>
                        <Breadcurmbs
                            items={tablePagebreadcrumbs}
                            separator=">"
                        />
                        <Title level={2}>{labels?.pageTitle}</Title>
                    </Flex>
                )}
                <Flex gap="middle" wrap={true} style={{ marginBottom: stylesVariable.orderDetailMargin }}>
                  
                    {orderList && (
                        <OrderTableView initialDataSource={orderList} userInfo={userInfo} tablePagebreadcrumbs={tablePagebreadcrumbs}  />
                    )}
                </Flex>
            </Content>
        </Layout>
    )
}

export default OrderDetailsPage
