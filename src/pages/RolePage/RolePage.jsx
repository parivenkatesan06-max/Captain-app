import React from "react"
import { Layout, Flex, Typography } from "antd"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import Button from "../../components/Button/Button"
import { PlusCircleFilled } from "@ant-design/icons"
import EmptyPlaceHolder from "../../components/EmptyPlaceHolder/EmptyPlaceHolder"
import styles from "./RolePage.module.scss";
import { useNavigate } from "react-router-dom"
import labels from "./RolePage.labels.json";
import designPattern from "../../styles/base/_variables.module.scss"

function RolePage() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const navigate = useNavigate()
  
    const handleClick = () => {
        navigate("/role/create-new-user") // Navigate to CreateNewUser page on click
    }
    const tablePagebreadcrumbs = [
        {
            title: "Role",
        }
    ]

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    <Flex
                        vertical={false}
                        gap={"1rem"}
                        justify="center"
                    >
                        <Button
                            label={labels?.userListLabel}
                            style={{ color: designPattern.buttonPrimary }}
                            iconPosition="end"
                            type="secondary"
                            size="large"
                            onClick={() => {
                                navigate("/role/user-list")
                            }}
                        />
                        <Button
                            label={labels?.addUserButtonLabel}
                            icon={<PlusCircleFilled />}
                            iconPosition="end"
                            type="primary"
                            size="large"
                            onClick={() => {
                                navigate("/role/create-new-user")
                            }}
                        />
                    </Flex>
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={tablePagebreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.createNewUserText}</Title>
                </Flex>

                <Flex
                    justify="center"
                    align="center"
                    className={styles.buttonContainer}
                >
                    <EmptyPlaceHolder
                        onClick={handleClick}
                        icon={<PlusCircleFilled />}
                        text={labels?.createNewUserText}
                    />
                </Flex>
            </Content>
        </Layout>
    )
}

export default RolePage
