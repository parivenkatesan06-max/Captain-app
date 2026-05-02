import React, { useEffect, useState } from "react"
import { Layout, Flex, Typography } from "antd"
import styles from "./TablePage.module.scss"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import apiUtil from "../../utility/ApiUtil/ApiUtil"
import endPoints from "../../utility/EndPoints"
import { useMutation, useQuery } from "@tanstack/react-query"
import { LogoutOutlined } from "@ant-design/icons"
import MenuTable from "../../components/MenuTable/MenuTable"
import StatusLegends from "../../components/StatusLegend/StatusLegends"
import { useNavigate } from "react-router-dom"
import RoleButton from "../../components/RolebasedLogout/RoleDropdown"
import Button from "../../components/Button/Button"
import CaptainHeader from "../../components/Header/CaptainHeader"
import { ROLES } from "../../utility/constants"
import { getUserInfo, resetUserInfo } from "../../utility/userInfo"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie";
import labels from "./TablePage.label.json";
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import ErrorPage from "../ErrorPage/ErrorPage"

function TablePage() {
    const userInfo = getUserInfo();
    const navigate = useNavigate()

    const { Header, Content } = Layout
    const { Title } = Typography

    const tablePagebreadcrumbs = [
        {
            title: labels?.breadcrumbTitle,
        },
    ]

    const tableApiUtil = new apiUtil()
    const [tableList, setTableList] = useState([])

    // Function to fetch all table statuses
    function getAllTableStatus() {
        return tableApiUtil.get(endPoints.getTableStatus)
    }

    let {
        data: onLoadData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["getAllTableStatus"],
        queryFn: getAllTableStatus,
    })

    const logoutApiUtil = new apiUtil();

    const logoutValidation = async () => {
        const accessToken = sessionStorage.getItem("accessToken");
        return logoutApiUtil.post(endPoints.logout, {
            token: accessToken,
        });
    };

    const triggerLogout = useMutation({
        mutationFn: logoutValidation,
        onSuccess: () => {
            resetUserInfo();
            navigate("/login");
        },
    });

    useEffect(() => {
        if (onLoadData?.data?.data) {
            setTableList(onLoadData?.data?.data.filter(table => table.status !== "Available"))
        }
    }, [onLoadData])

    const handleclick = (tableId) => {
        navigate(`/table/${tableId}/order-details`)
    }

    if (isLoading) {
        return (
            <LoaderLottie />
        )
    }

    if (isError) {
        return <ErrorPage />;  
    }
    function capitalizeFirstLetter(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }

    return (
        <Layout className="layoutWrapper">
            {userInfo.role === ROLES.CAPTAIN ? (
                <CaptainHeader title={labels?.tablePageTitle}>
                    <Flex gap={11}>
                        <RoleButton userInfo={userInfo} />
                        <Button
                            label={labels?.logoutButtonLabel}
                            icon={<LogoutOutlined />}
                            iconPosition="end"
                            type="primary"
                            size="large"
                            style={{ height: stylesVariable.tablePageHeight }}
                            onClick={() => triggerLogout.mutate()}
                        />
                    </Flex>
                </CaptainHeader>
            ) : (
                <Header className="pageHeaderWrapper">
                    <PageHeader />
                </Header>
            )}
            <Content className="contentWrapper">
                {userInfo.role !== ROLES.CAPTAIN && (
                    <Flex vertical>
                        <Breadcurmbs
                            items={tablePagebreadcrumbs}
                            separator=">"
                        />
                        <Title level={2}>{labels?.tablePageTitle}</Title> 
                    </Flex>
                )}
                <div className={styles.container}>
                    {userInfo.role === ROLES.CAPTAIN && (
                        <Breadcurmbs
                            items={tablePagebreadcrumbs}
                            separator=">"
                            style={{ width: stylesVariable.tablePageBreadcrumbsWidth, marginBottom: stylesVariable.twoRem }}
                        />
                    )}
                    <Flex
                        wrap
                        className={styles.tableContainer}
                        style={{ rowGap: stylesVariable.tablePageRowGap, columnGap: stylesVariable.tablePageColumnGap }}
                    >
                        {tableList?.map((table) => {
                            return (
                                <MenuTable
                                    key={table.identifier}
                                    tableNumber={capitalizeFirstLetter(
                                        table.identifier
                                    )}
                                    price={table.price}
                                    tableStatus={table.status}
                                    onClick={() => handleclick(table.identifier)}
                                    currency={table.currency}
                                    paymentStatus={table.paymentStatus}
                                />
                            )
                        })}
                    </Flex>
                    <StatusLegends />
                </div>
            </Content>
        </Layout>
    )
}

export default TablePage
