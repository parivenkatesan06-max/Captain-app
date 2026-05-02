import React, { useEffect, useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { Layout, Typography, Table, Flex, ConfigProvider, Pagination, Result } from "antd"
import { Link, useNavigate } from "react-router-dom"
import PageHeader from "../../components/Header/Header"
import Breadcrumbs from "../../components/Breadcrumbs/Breadcurmbs"
import { PlusCircleFilled } from "@ant-design/icons"
import apiUtil from "../../utility/ApiUtil"
import endPoints from "../../utility/EndPoints"
import styles from "./UserListPage.module.scss"
import labels from "./UserListPage.label.json"
import Button from "../../components/Button/Button"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import ErrorPage from "../ErrorPage/ErrorPage"
import designPatterns from "../../styles/base/_variables.module.scss"
import { getUserInfo } from "../../utility/userInfo"
import { ROLE_NAME } from "../../utility/constants"

const userApiUtil = new apiUtil()

const UserListPage = () => {
    const { Header, Content } = Layout
    const { Title } = Typography
    const navigate = useNavigate()
    const [userList, setUserList] = useState([])
    const [currentPage, setCurrentPage] = useState(1);
    const [totalItems, setTotalItems] = useState(0);
    const pageSize = 10;
    const userInfo = getUserInfo();
    const tablePagebreadcrumbs = [
        { title: <Link to={"/role"}>Role</Link> },
        { title: "UserList" },
    ];
    function getUsersList(pageNum) {
        return userApiUtil.get(
            `${endPoints.getUsersList}?page=${pageNum}&itemsPerPage=${pageSize}&clientCode=${userInfo?.clientInfo?.clientCode}&roleName=${ROLE_NAME.CLIENT_ADMIN}`
        );
    }

    let {
        data: onLoadData,
        isLoading,
        isError,
        refetch,
    } = useQuery({
        queryKey: ["getUsersList", currentPage],
        queryFn: () => getUsersList(currentPage),
    });

    useEffect(() => {
        if (onLoadData?.data?.data) {
            const currentData = onLoadData?.data?.data;
            setUserList(currentData);
            const hasMoreData = currentData.length === pageSize;
            setTotalItems(hasMoreData ? (currentPage + 1) * pageSize : currentPage * pageSize);
        }
    }, [onLoadData, currentPage]);

    if (isLoading) {
        return <LoaderLottie />
    }

    if (isError) {
        return <ErrorPage />;
    }

    const columns = [
        {
            title: labels?.title,
            key: "email",
            width: "30%",
            dataIndex:"email"
        },
        {
            title: labels?.role,
            dataIndex: "roleName",
            key: "roleName",
            width: "30%",
        }
    ]


    const handleNewUser = () =>{
        navigate("/role/create-new-user")
    }
    
    const handlePageChange = (page) => {
        setCurrentPage(page);
        refetch();
    };

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    <Button
                        type="primary"
                        label="New User"
                        onClick={handleNewUser}
                        icon={<PlusCircleFilled />}
                        iconPosition="end"
                    />
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Breadcrumbs items={tablePagebreadcrumbs} separator=">" />
                <Title level={2}>{labels?.pageTitle}</Title>
                <div className={styles.userContainer}>
                    <Table
                        className={styles.userTable}
                        columns={columns}
                        dataSource={userList}
                        pagination={false}
                        rowKey="id"
                        bordered
                        scroll={{ y: 623 }}
                        locale={{
                            emptyText: (
                                <Flex justify="center" align="center" style={{ padding: "20px" }}>
                                    <Result
                                        status="404"
                                        title="No Data Found"
                                    />
                                </Flex>
                            ),
                        }}
                    />
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
                            total={totalItems}
                            pageSize={pageSize}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            align="end"
                            style={{
                                textAlign: "right",
                                marginTop: "20px",
                            }}
                            onChange={handlePageChange}
                        />
                    </ConfigProvider>
                </div>
            </Content>
        </Layout>
    )
}

export default UserListPage
