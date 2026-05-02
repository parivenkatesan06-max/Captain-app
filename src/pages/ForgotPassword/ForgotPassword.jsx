import React, { useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { Col, Flex, Row, Alert, ConfigProvider } from "antd"
import styles from "./ForgotPassword.module.scss"
import LoginPage from "../../assets/Image/LoginPage.svg"
import InputForms from "../../components/InputForms/InputForms"
import config from "./config.json"
import labels from "./label.json"
import Button from "../../components/Button/Button"
import apiUtil from "../../utility/ApiUtil/ApiUtil"
import endPoints from "../../utility/EndPoints"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import designPatterns from "../../styles/base/_variables.module.scss"
import CustomMessage from "../../components/CustomMessage/CustomMessage"
import { Link } from "react-router-dom"


const ForgotPassword = () => {
    const [isErrorMessage, setIsErrorMessage] = useState(false)
    const [isSuccessMessage, setIsSuccessMessage] = useState(false)
    const [messageContent, setMessageContent] = useState("")
    
    const formRef = useRef()

    const forgotPasswordApiUtil = new apiUtil()

    async function loginValidation() {
        const values = await formRef.current.validateAndCheck()
        const { email } = values
        return forgotPasswordApiUtil.post(endPoints.forgotPassword, {
            email,
        })
    }

    const triggerForgotPassword = useMutation({
        mutationFn: loginValidation,
        onSuccess: (data) => {
            setIsSuccessMessage(true)           
            const message = data?.data?.data?.message
            setMessageContent(message || "Invalid")
            setIsErrorMessage(false)
        },
        onError:(error) =>{
            setIsSuccessMessage(false)           
            const message = error?.response.data.errors[0].message
            console.log(error?.response.data.errors[0].message, "message")
            setMessageContent(message || "Invalid")
            setIsErrorMessage(true)
        }
    })

    const handleSend = async () => {
        const values = await formRef.current.validateAndCheck()
        if (values) {
            triggerForgotPassword.mutate()
        }
    }


    return (
        <Row className={styles.loginRow}>
            <Col span={12} className={styles.imageSection}>
                <div className={styles.svgContainer}>
                    <img src={LoginPage} alt="logo" className={styles.svg} />
                    <div className={styles.imageText}>
                        <p className={styles.textContent}>
                            {labels.adminAccountText}
                        </p>
                    </div>
                </div>
            </Col>
            <Col span={12} className={styles.formContainer}>
                <Flex vertical align="center" style={{ marginTop: stylesVariable.welcomeMarginTop }}>
                    <h1 className={styles.largeHeading}>
                        {labels.welcomeMessage}
                    </h1>
                </Flex>
                <Flex
                    align="center"
                    style={{ flex: 1, flexDirection: "column"  }}
                    className={styles.loginFormContainer}
                >
                    {triggerForgotPassword?.error && (
                        <Alert
                            style={{ marginBottom: stylesVariable.oneRem }}
                            message={
                                triggerForgotPassword?.error?.data?.message ||
                                "Incorrect email"
                            }
                            type="error"
                        />
                    )}
                    <InputForms
                        config={config}
                        ref={formRef}
                        className={styles.inputForm}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    className={styles.buttonContainer}
                >
                    <Button
                        type="primary"
                        className={styles.button}
                        label={labels.buttonLabel}
                        onClick={handleSend}
                    />
                    <div className={styles.loginTab}>
                        <Link 
                            to="/login" 
                            className={styles.linkTab}
                        >
                            {labels?.backToLogin}
                        </Link>
                    </div>
                 
                    <ConfigProvider
                        theme={{
                            components: {
                                Message: {
                                    contentBg: designPatterns.buttonPrimary,
                                },
                            },
                            token: {
                                colorText: designPatterns.tableBgColor,
                                colorSuccess: designPatterns.tableBgColor,
                                borderRadiusLG: 20,
                                colorError: designPatterns.tableBgColor,
                            },
                        }}
                    >
                        <CustomMessage
                            isVisible={isErrorMessage || isSuccessMessage}
                            type={isErrorMessage ? "error" : "success"}
                            content={messageContent}
                            duration={3}
                        />
                    </ConfigProvider>
                </Flex>
                
            </Col>
        </Row>
    )
}

export default ForgotPassword
