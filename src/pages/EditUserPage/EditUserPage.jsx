import React, { useState, useEffect, useRef } from "react"
import {
    Layout,
    Row,
    Col,
    Typography,
    Flex,
} from "antd"
import { useNavigate, Link, useLocation } from "react-router-dom"
import PageHeader from "../../components/Header/Header"
import Breadcrumbs from "../../components/Breadcrumbs/Breadcurmbs"
import Button from "../../components/Button/Button"
import ApiUtil from "../../utility/ApiUtil"
import editLabels from "./EditUserPage.label.json"
import config from "./EditUserPage.config.json"
import endPoints from "../../utility/EndPoints"
import styles from "./EditUserPage.module.scss"
import Role from "../../assets/Image/role1.svg"
import Toast from "../../components/Toast/Toast"
import InputForms from "../../components/InputForms/InputForms"

const signUpApiUtil = new ApiUtil()

const EditUserPage = () => {
    const { Header, Content } = Layout
    const formRef = useRef()
    const { Title } = Typography
    const navigate = useNavigate()
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const location = useLocation()

    // Retrieve the user data from the location state
    const { user } = location.state
    // Set default form values based on user data
    useEffect(() => {
        if (user) {
            formRef.current.setFieldsValue({
                email: user.email,
                password: user.password, 
            });
        }
    }, [user])

    const handleCancel = () => {
        navigate("/role/user-list")
    }

    const handleSave = async () => {
        try {
            const values = await formRef.current.validateAndCheck()
            if (values) {
                const { email, password, role } = values
                const response = await signUpApiUtil.post(endPoints.register, {
                    email,
                    password,
                    role,
                })
                console.log("Success:", response.data)
                setShowToast(true)
                setToastMessage("Account created successfully!")
                setTimeout(() => {
                    setShowToast(false)
                    setToastMessage(" ")
                    navigate("/role/user-list")
                }, 3000)
            }
        } catch (error) {
            console.error("Error:", error)
            const errorMessage =
                error?.data?.message ||
                "Failed to create account. Please try again."

            setShowToast(true)
            setToastMessage(errorMessage)
            setTimeout(() => {
                setShowToast(false)
                setToastMessage(" ")
            }, 3000)
        }
    }

    const tablePagebreadcrumbs = [
        {
            title: <Link to={"/role"}>Role</Link>,
        },
        {
            title: <Link to={"/role/user-list"}>User List</Link>,
        },
        {
            title: editLabels?.pageTitle,
        },
    ]

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader />
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Flex vertical>
                        <Breadcrumbs
                            items={tablePagebreadcrumbs}
                            separator=">"
                        />
                        <Title level={2}>{editLabels?.pageTitle}</Title>
                    </Flex>
                    <Row className={styles.signupRow}>
                        <Toast
                            message={toastMessage}
                            visible={showToast}
                            duration={3000}
                            onClose={() => setShowToast(false)} // Hide toast on close
                        />
                        <Col span={12} className={styles.formContainer}>

                            {
                                <>
                                    <div className={styles.inputForm}>
                                        <InputForms
                                            config={config}
                                            
                                            ref={formRef}
                                            initialValues={{
                                                email: user?.email,
                                                password: user?.password,
                                                role: user?.role,
                                            }}
                                        />
                                    </div>
                                    <Flex
                                        vertical={false}
                                        gap={"1rem"}
                                        justify="center"
                                        className={styles.buttonContainer}
                                    >
                                        <Button
                                            type="default"
                                            label={
                                                editLabels?.cancelButtonLabel
                                            }
                                            onClick={handleCancel}
                                        />
                                        <Button
                                            type="primary"
                                            label={
                                                editLabels?.submitButtonLabel
                                            }
                                            onClick={handleSave}
                                        />
                                    </Flex>
                                </>
                            }
                        </Col>
                        <Col span={12}>
                            <img
                                src={Role}
                                alt="captain-image"
                                className={styles.signupSVG}
                            />
                        </Col>
                    </Row>
                </Flex>
            </Content>
        </Layout>
    )
}

export default EditUserPage
