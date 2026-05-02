import React, { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Col, Flex, Row, ConfigProvider, Modal } from "antd";
import styles from "./ResetTempPassword.module.scss";
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
import { useNavigate } from "react-router-dom";

const ResetTempPassword = () => {
    const [isErrorMessage, setIsErrorMessage] = useState(false);
    const [isSuccessMessage, setIsSuccessMessage] = useState(false);
    const [messageContent, setMessageContent] = useState("");
    const [isModalVisible, setIsModalVisible] = useState(false)
    const navigate = useNavigate()
    const formRef = useRef();
    const resetTempPasswordApiUtil = new apiUtil();

    async function resetPasswordValidation(values) {
        const { email, oldPassword, confirmPassword} = values;
        return resetTempPasswordApiUtil.post(endPoints.resetTempPassword, {
            email,
            oldPassword: oldPassword,
            password: confirmPassword,
        });
    }

    const triggerResetTempPassword = useMutation({
        mutationFn: resetPasswordValidation,
        onSuccess: (data) => {
            setIsSuccessMessage(false);
            const message = data?.data?.data?.message;
            setMessageContent(message || "Password reset successful");
            setIsErrorMessage(false);
            setIsModalVisible(true)
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
            console.log("Form values:", values); 

            if (!values || typeof values !== "object") {
                console.error("No valid form values returned");
                setIsErrorMessage(true);
                setMessageContent("Please fill out all required fields.");
                setIsSuccessMessage(false);
                return;
            }
            triggerResetTempPassword.mutate(values);
        } catch (error) {
            setIsErrorMessage(true);
            setMessageContent(error.message || "Validation failed");
            setIsSuccessMessage(false);
        }
    };
    const handleRoute =()=>{
        navigate("/login")
        setIsModalVisible(false)
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
                    style={{ flex: 1, flexDirection: "column" }}
                    className={styles.loginFormContainer}
                >
                    <InputForms
                        config={config}
                        ref={formRef}
                        className={styles.inputForm}
                        initialValues={{ email: localStorage.getItem("email")}} 
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
                        loading={triggerResetTempPassword.isLoading}
                    />
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
                    <Modal
                        title={messageContent}
                        open={isModalVisible}
                        footer={[
                            <Button key="login" label="Go to Login Again" onClick={handleRoute} />,
                        ]}
                    >
                    </Modal>
                </Flex>
            </Col>
        </Row>
    );
};

export default ResetTempPassword;