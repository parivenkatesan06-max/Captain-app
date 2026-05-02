import React, { useRef, useState } from "react"
import {
    ConfigProvider,
    Layout,
    Row,
    Col,
    Typography,
    Segmented,
    Flex,
} from "antd"
import { useNavigate, Link } from "react-router-dom"
import PageHeader from "../../components/Header/Header"
import Breadcrumbs from "../../components/Breadcrumbs/Breadcurmbs"
import Button from "../../components/Button/Button"
import InputForms from "../../components/InputForms/InputForms"
import ApiUtil from "../../utility/ApiUtil"
import signupTexts from "./CreateUser.label.json"
import config from "./CreateUser.config.json"
import endPoints from "../../utility/EndPoints"
import styles from "./CreateUser.module.scss"
import Role from "../../assets/Image/role1.svg"
import Toast from "../../components/Toast/Toast"
import designPattern from "../../styles/base/_variables.module.scss"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import { getUserInfo } from "../../utility/userInfo"
import { ENTITY } from "../../utility/constants"

const signUpApiUtil = new ApiUtil()

const CreateNewUser = () => {
    const { Header, Content } = Layout
    const { Title } = Typography
    const navigate = useNavigate()
    const formRef = useRef()
    const nameFormRef = useRef()
    const lastNameFormRef = useRef()
    const [alignValue, setAlignValue] = useState("Captain")
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [isFormValid, setIsFormValid] = useState(false)
    const userInfo = getUserInfo();

    const validateMainForm = (values) => {
        return values?.email && 
               values?.mobile && 
               values?.password && 
               values?.confirmPassword &&
               values?.password === values?.confirmPassword;
    };

    const checkFormValidity = () => {
        if (!formRef.current || !nameFormRef.current || !lastNameFormRef.current) {
            return;
        }

        const mainFormValues = formRef.current.getFieldsValue();
        const firstNameFormValues = nameFormRef.current.getFieldsValue();
        const lastNameFormValues = lastNameFormRef.current.getFieldsValue();

        const isMainFormValid = validateMainForm(mainFormValues);
        const isNameValid = Boolean(firstNameFormValues?.firstName);
        const isLastNameValid = Boolean(lastNameFormValues?.lastName);

        setIsFormValid(isMainFormValid && isNameValid && isLastNameValid);
    };

    const handleFormChange = () => {
        checkFormValidity();
    };

    const handleCancel = () => {
        formRef.current.resetFields()
        navigate("/role");
    }
    const handleSave = async () => {
        try {
            const values = await formRef.current.validateAndCheck();
            const valuesName = await nameFormRef.current.validateAndCheck();
            const lastNameValues= await lastNameFormRef.current.validateAndCheck();
            if (values) {
                if (values.password !== values.confirmPassword) {
                    setShowToast(true);
                    setToastMessage("Passwords do not match");
                    setTimeout(() => setShowToast(false), 3000);
                    return;
                }

                const { email, password, mobile } = values;
                const {firstName} = valuesName;
                const {lastName} = lastNameValues
                const response = await signUpApiUtil.post(endPoints.register, {
                    firstName,
                    lastName,
                    mobile,
                    email,
                    password,
                    roleCode: "2-CD",
                    clientGroupCode: userInfo?.clientInfo?.clientGroupCode,
                    clientCode: userInfo?.clientInfo?.clientCode,
                    isTemporaryPassword: 1
                });
                
                setShowToast(true);
                setToastMessage( response?.data?.data?.message || "Account created successfully!");
                setTimeout(() => {
                    setShowToast(false);
                    setToastMessage("");
                    formRef.current.resetFields();
                    navigate("/role/user-list");
                }, 3000);
            }
        } catch (error) {
            const errorMessage =
                error?.response?.data?.errors[0]?.message ||
                "Failed to create account. Please try again."

            setShowToast(true)
            setToastMessage(errorMessage)
            setTimeout(() => {
                setShowToast(false); 
                setToastMessage(" ")
            }, 3000);

        }
    }

    const tablePagebreadcrumbs = [
        {
            title: <Link to={"/role"}>Role</Link>,
        },
        {
            title: signupTexts?.pageTitle,
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
                        <Title level={2}>{signupTexts?.pageTitle}</Title>
                    </Flex>
                    <Row className={styles.signupRow}>
                        <Toast
                            message={toastMessage}
                            visible={showToast}
                            duration={3000}
                            onClose={() => setShowToast(false)} // Hide toast on close
                        />
                        <Col span={24} md={12} className={styles.formContainer}>
                            {userInfo?.entity !== ENTITY.THEATRE && (
                                <ConfigProvider
                                    theme={{
                                        components: {
                                            Segmented: {
                                                itemSelectedBg: designPattern.tableBgColor,
                                                itemSelectedColor: designPattern.buttonPrimary,
                                                trackPadding: 10,
                                            },
                                        },
                                    }}
                                >
                                    <Segmented
                                        value={alignValue}
                                        className={styles.segmentedView}
                                        onChange={(newAlignValue) => {
                                            if (newAlignValue !== alignValue) {
                                                setAlignValue(newAlignValue)
                                            }
                                        }}
                                        options={[signupTexts?.captainLabel, signupTexts?.kitchenerLabel]}
                                        block
                                    />
                                </ConfigProvider>
                            ) }

                            {
                                <>
                                    {/* Custom Row for First Name and Last Name */}
                                    <Row gutter={16} className={styles.nameRow}>
                                        <Col span={12}>
                                            <InputForms
                                                config={{ inputs: { firstName: config?.inputs?.firstName } }}
                                                ref={nameFormRef}
                                                className={styles.nameInputForms}
                                                onValuesChange={handleFormChange}
                                            />
                                        </Col>
                                        <Col span={12}>
                                            <InputForms
                                                config={{ inputs: { lastName: config?.inputs?.lastName } }}
                                                ref={lastNameFormRef}
                                                className={styles.nameInputForms}
                                                onValuesChange={handleFormChange}
                                            />
                                        </Col>
                                    </Row>

                                    {/* Remaining Fields */}
                                    <InputForms
                                        config={{
                                            inputs: {
                                                mobile: config?.inputs?.mobile,
                                                email: config?.inputs?.email,
                                                password: config?.inputs?.password,
                                                confirmPassword: config?.inputs?.confirmPassword,
                                            },
                                        }}
                                        ref={formRef}
                                        className={styles.inputForm}
                                        onValuesChange={handleFormChange}
                                    />
                                    <Flex
                                        vertical={false}
                                        gap={10}
                                        justify="center"
                                        className={styles.buttonContainer}
                                    >
                                        <Button
                                            type="default"
                                            label={signupTexts?.cancelButtonLabel}
                                            onClick={handleCancel}
                                            style={{width: stylesVariable.widthCentPercent}}
                                        />
                                        <Button
                                            type="primary"
                                            label={signupTexts?.submitButtonLabel}
                                            onClick={handleSave}
                                            disabled={!isFormValid}
                                            style={{width: stylesVariable.widthCentPercent}}
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

export default CreateNewUser
