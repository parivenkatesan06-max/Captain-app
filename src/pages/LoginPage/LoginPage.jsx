import React, { useEffect, useRef, useState } from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Alert, Col, Flex, Row } from "antd"
// import { Link } from "react-router-dom"
import styles from "./LoginPage.module.scss"
import LoginPage from "../../assets/Image/LoginPage.svg"
import InputForms from "../../components/InputForms/InputForms"
import config from "./config.json"
import labels from "./label.json"
import Button from "../../components/Button/Button"
// import designPatterns from "../../styles/base/_variables.module.scss"
import apiUtil from "../../utility/ApiUtil/ApiUtil"
import endPoints from "../../utility/EndPoints"
import { setUserInfo,setClientLogo } from "../../utility/userInfo"
// import { CLIENT } from "../../utility/constants"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import { ERROR_CODE, ROLE_NAME } from "../../utility/constants"

const LoginComponent = () => {
    const [isChecked, setIsChecked] = useState(false)
    const [userInfo, setUserInfoState] = useState(null)
    const navigate = useNavigate()

    const formRef = useRef()

    const loginApiUtil = new apiUtil()

    async function loginValidation() {
        const values = await formRef.current.validateAndCheck()
        const { email, password } = values
        return loginApiUtil.post(endPoints.login, {
            email,
            password,
        })
    }

    const triggerLogin = useMutation({
        mutationFn: loginValidation,
        onSuccess: (data) => {
            const userInfo = data?.data?.data
            setUserInfo(userInfo)
            setUserInfoState(userInfo)
            triggerClient.mutate(data?.data?.data?.clientGroupCode)
            const currentTime = new Date();
            const refreshTokenExpiryTime = currentTime.getTime() + (90 * 24 * 60 * 60 * 1000);
            sessionStorage.setItem("refresh_token_expiry", refreshTokenExpiryTime);
        },
        onError: (error) =>{
            if(error?.response?.data?.errors[0].code === ERROR_CODE.FORCE_RESET_TEMPORORY_PASSWORD){
                navigate("/reset-temporary-password")
            }
        }
    })

    function getClientLogo(clientCode) {
        return loginApiUtil.get(
            `${endPoints.client}/${clientCode}`
        );
    }

    const triggerClient = useMutation({
        mutationFn: (clientGroupCode) => getClientLogo(clientGroupCode),
        onSuccess: (data) => {
            const clientInfo = data?.data?.data
            // Find the specific client info based on userInfo.clientCode
            const specificClient = Array.isArray(clientInfo) 
                ? clientInfo.find(client => client?.clientCode === userInfo?.clientCode)
                : clientInfo;
            
            if (specificClient?.logo_url) {
                setClientLogo(specificClient.logo_url)
            }
            // Function to handle login redirection
            if (userInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
                navigate("/")
            } else {
                navigate("/role")
            }
        },
        onError: (error) =>{
            console.log(error,"error")
        }
    })

    const handleSave = async () => {
        const values = await formRef.current.validateAndCheck()
        if (values) {
            triggerLogin.mutate()
        }
    }

    const handleCheckboxChange = (checked) => {
        setIsChecked(checked)
    }

    // Add event listener for "Enter" key press
    useEffect(() => {
        const handleKeyPress = (e) => {
            if (e.key === "Enter" && isChecked) {
                handleSave()
            }
        };
        document.addEventListener("keydown", handleKeyPress);
        // Cleanup the event listener when the component is unmounted
        return () => {
            document.removeEventListener("keydown", handleKeyPress);
        };
    }, [isChecked]);

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
                    {triggerLogin?.error && (
                        <Alert
                            style={{ marginBottom: stylesVariable.oneRem }}
                            message={
                                triggerLogin?.error?.data?.message ||
                                "Incorrect email or password"
                            }
                            type="error"
                        />
                    )}
                    <InputForms
                        config={config}
                        ref={formRef}
                        className={styles.inputForm}
                        onCheckboxChange={handleCheckboxChange}
                        forgotpassword = {true}
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
                        disabled={!isChecked}
                        onClick={handleSave}
                    />
                    {/* <div className={styles.signupText}>
                        <span> {labels.signupTexthelper} </span>
                        <Link
                            to={labels.signupLink}
                            style={{
                                color: designPatterns.buttonPrimary,
                            }}
                        >
                            {labels.signupText}
                        </Link>
                    </div> */}
                </Flex>
                
            </Col>
        </Row>
    )
}

export default LoginComponent
