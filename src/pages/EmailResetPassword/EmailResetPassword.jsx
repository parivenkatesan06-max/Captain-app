import React, { useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Col, Flex, Row, ConfigProvider } from "antd";
import styles from "./EmailResetPassword.module.scss";
import LoginPage from "../../assets/Image/LoginPage.svg";
import InputForms from "../../components/InputForms/InputForms";
import config from "./config.json";
import labels from "./label.json";
import Button from "../../components/Button/Button";
import apiUtil from "../../utility/ApiUtil/ApiUtil";
import endPoints from "../../utility/EndPoints";
import stylesVariable from "../../styles/base/_stylesVariable.module.scss";
import designPatterns from "../../styles/base/_variables.module.scss";
import CustomMessage from "../../components/CustomMessage/CustomMessage";
import { Link, useLocation } from "react-router-dom";

const EmailResetPassword = () => {
    const [isErrorMessage, setIsErrorMessage] = useState(false);
    const [isSuccessMessage, setIsSuccessMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");

    const formRef = useRef();
    const emailResetPasswordApiUtil = new apiUtil(null, null, true);
    const location = useLocation();
    const searchParams = new URLSearchParams(location.search);
    const info = searchParams.get("info");
    console.log(location.pathname,"location")
    useEffect(() => {
        if (info) {
            localStorage.setItem("info", info);
        }
    }, [info]); // Fixed dependency array syntax

    async function resetPasswordValidation(values) {
        const { confirmPassword } = values;
        const authToken = localStorage.getItem("info");

        const headers = {
            Authorization: `Bearer ${authToken}`,
        };

        return emailResetPasswordApiUtil.post(
            endPoints.emailResetPassword,
            {
                password:confirmPassword,
            },
            { headers }
        );
    }

    const triggerEmailResetPassword = useMutation({
        mutationFn: resetPasswordValidation,
        onSuccess: (data) => {
            setIsSuccessMessage(true);
            const message = data?.data?.data?.message;
            setMessageContent(message || "Password reset successful");
            setIsErrorMessage(false);
        },
        onError: (error) => {
            setIsSuccessMessage(false);
            const message = error?.response?.data?.errors[0]?.message;
            setMessageContent(message || "An error occurred");
            setIsErrorMessage(true);
        },
    });

    const handleReset = async () => {
        try {
            const values = await formRef.current.validateAndCheck();

            if (!values || typeof values !== "object") {
                setIsErrorMessage(true);
                setMessageContent("Please fill out all fields.");
                setIsSuccessMessage(false);
                return;
            }

            const { password, confirmPassword } = values;

            if (password !== confirmPassword) {
                setIsErrorMessage(true);
                setMessageContent("Passwords do not match");
                setIsSuccessMessage(false);
                return;
            }

            triggerEmailResetPassword.mutate(values);
        } catch (error) {
            setIsErrorMessage(true);
            setMessageContent(error.message || "Validation failed");
            setIsSuccessMessage(false);
        }
    };

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
                    style={{ flex: 1, flexDirection: "column" }}
                    className={styles.loginFormContainer}
                >
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
                        onClick={handleReset}
                        loading={triggerEmailResetPassword.isLoading}
                    />
                    <div className={styles.loginTab}>
                        <Link to="/login" className={styles.linkTab}>
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
    );
};

export default EmailResetPassword;