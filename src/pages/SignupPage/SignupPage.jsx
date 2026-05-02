import React, {  useRef, useState } from "react"
import { Row, Col, Flex, Alert } from "antd"
import { useMutation } from "@tanstack/react-query"
import {   useNavigate } from "react-router-dom"
import styles from "./Signuppage.module.scss"
import SignupImage from "../../assets/Image/signup.svg"
import InputForms from "../../components/InputForms/InputForms"
import config from "./Signup.config.json"
import Button from "../../components/Button/Button"
import ApiUtil from "../../utility/ApiUtil"
import signupTexts from "./Signup.label.json"
import designPatterns from "../../styles/base/_variables.module.scss"
// import { ReactComponent as KuppannaLogo } from "../../assets/Logo/kuppanna.svg"
// import { ReactComponent as PVRLogo } from "../../assets/Logo/pvr.svg"
import { Link } from "react-router-dom"
import endPoints from "../../utility/EndPoints"
// import { CLIENT } from "../../utility/constants"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"

const SignupComponent = () => {
    const formRef = useRef()
    // const location = useLocation();
    const navigate = useNavigate()
    const [isChecked, setIsChecked] = useState(false)
    // const { client } = useParams()
    // const location = useLocation()
    // const urlParams = new URLSearchParams(location.search)
    // const client = urlParams.get("client")
   
 


    const handleCheckboxChange = (checked) => {
        setIsChecked(checked)
    }

    const signUpApiUtil = new ApiUtil()

    const handleSignUp = async () => {
        const values = await formRef.current.validateAndCheck()
        if (values) {
            triggerSignUp.mutate()
        }
    }

    async function signUpValidation() {
        const values = await formRef.current.validateAndCheck()
        const { email, password } = values
        return signUpApiUtil.post(endPoints.register, {
            email,
            password,
            role: "admin",
        })
    }

    const triggerSignUp = useMutation({
        mutationFn: signUpValidation,
        onSuccess: () => {
            navigate("/login")
        },
    })

    return (
        <Row className={styles.signupRow}>
            <Col span={12} className={styles.imageSection}>
                <div className={styles.svgContainer}>
                    <img
                        src={SignupImage}
                        alt="signupimage"
                        className={styles.svg}
                    />
                    <div className={styles.imageText}>
                        <p className={styles.textContent}>
                            {signupTexts?.description}
                        </p>
                    </div>
                </div>
            </Col>
            <Col span={12} className={styles.formContainer}>
                <Flex vertical align="center" style={{ marginTop: stylesVariable.signupWelcomeMarginTop }}>
                    <h1 className={styles.largeHeading}>
                        {signupTexts?.heading}
                    </h1>
                </Flex>
                <Flex
                    align="center"
                    style={{ flex: 1, flexDirection: "column" }}
                    className={styles.signupFormContainer}
                >
                    {triggerSignUp?.error && (
                        <Alert
                            style={{ marginBottom: stylesVariable.oneRem }}
                            message={
                                triggerSignUp?.error?.data?.message ||
                                "Something went wrong. Please try again later."
                            }
                            type="error"
                        />
                    )}
                    <InputForms
                        config={config}
                        className={styles.inputForm}
                        onCheckboxChange={handleCheckboxChange}
                        ref={formRef}
                    />
                </Flex>
                <Flex
                    vertical
                    justify="center"
                    className={styles.buttonContainer}
                >
                    <Button
                        type="primary"
                        label={signupTexts?.buttonLabel}
                        disabled={!isChecked}
                        onClick={handleSignUp}
                    />
                    <div className={styles.signupText}>
                        <span>{signupTexts?.linkText}</span>
                        <Link
                            to={signupTexts?.loginLink}
                            style={{
                                color: designPatterns.buttonPrimary,
                                textDecoration: "none",
                            }}
                        >
                            {signupTexts.linkLabel}
                        </Link>
                    </div>
                </Flex>
            </Col>
        </Row>
    )
}

export default SignupComponent
