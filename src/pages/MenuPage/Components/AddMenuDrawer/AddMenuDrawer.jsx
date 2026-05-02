import React, { useEffect, useState } from "react"
import {
    Input,
    Select,
    InputNumber,
    Form,
    Divider,
    Spin,
    ConfigProvider,
    Tooltip,
} from "antd"
import styles from "./AddMenuDrawer.module.scss"
import Button from "../../../../components/Button/Button"
import uploadImage from "../../../../assets/Image/uploadImage.svg"
import { CustomFileInput } from "../AddMenuTable/AddMenuTableUtils"
import labels from "./AddMenuDrawer.label.json"
import stylesVariable from "../../../../styles/base/_stylesVariable.module.scss"
import ApiUtil from "../../../../utility/ApiUtil"
import { useMutation, useQuery } from "@tanstack/react-query"
import EndPoints from "../../../../utility/EndPoints"
import { getUserInfo } from "../../../../utility/userInfo"
import designPatterns from "../../../../styles/base/_variables.module.scss"
import CustomMessage from "../../../../components/CustomMessage/CustomMessage"

const AddMenuDrawer = ({ onSave, isDrawerVisible, setIsHappened, onCategoryChange }) => {
    const [form] = Form.useForm()
    const initialMenuState = {
        menuName: "",
        menuCategory: "",
        price: "",
        image: uploadImage, // Default image
        menuDescription: "",
        offerPct: 0,
    }

    const [newMenu, setNewMenu] = useState(initialMenuState)
    const [item, setItem] = useState("")
    const [items, setItems] = useState([])
    const menuApiUtil = new ApiUtil()
    const [loadingImage, setLoadingImage] = useState(false) // Loading state for image upload
    const userInfo = getUserInfo()
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorMessage, setIsErrorMessage] = useState(false)
    const [isSuccessMessage, setIsSuccessMessage] = useState(false)
    const [messageContent, setMessageContent] = useState("")

    useEffect(() => {
        if (!isDrawerVisible) {
            form.resetFields()
            setNewMenu(initialMenuState)
        } else{
            refetch()
        }
    }, [isDrawerVisible, form])

    useEffect(() => {
        if (form) {
            form.setFieldsValue(newMenu) // Set the newMenu values in the form
        }
    }, [newMenu, form])

    const handleChange = (key, value) => {
        setNewMenu((prev) => ({ ...prev, [key]: value }))
    }

    const handleImageUpload = (e) => {
        const file = e?.target?.files[0]
        if (file) {
            const formData = new FormData()
            formData.append("file", file)
            setLoadingImage(true)
            // Trigger the upload mutation
            triggerUploadmenu.mutate(formData);
        }
    }

    const handleSubmit = async () => {
        try {
            await form.validateFields() // Validate the form before proceeding
            onSave(newMenu) // Pass the data to the parent (onSave)
            form.resetFields() // Reset form fields
            setNewMenu(initialMenuState) // Reset state to initial values
        } catch (error) {
            console.log("Validation failed:", error)
        }
    }

    const addItem = (e) => {
        e.preventDefault()
        setItem("")
        const data = {
            clientCode: userInfo?.clientInfo?.clientCode,
            name: item,
        }
        setIsLoading(true)
        triggerAddCategory.mutate(data)
    }

    const getAllCategory = () =>
        menuApiUtil.get(
            `${EndPoints.menuCategory}?clientCode=${userInfo?.clientInfo?.clientCode}&page=1&itemsPerPage=10`
        )

    const { data: onLoadDataCategory, refetch } = useQuery({
        queryKey: ["getAllCategory"],
        queryFn: getAllCategory,
    })

    useEffect(() => {
        if (onLoadDataCategory?.data?.data) {
            setItems(onLoadDataCategory?.data?.data)
        }
    }, [onLoadDataCategory?.data?.data])

    const triggerAddCategory = useMutation({
        mutationFn: (data) => {
            return menuApiUtil.post(EndPoints.menuCategory, data)
        },
        onSuccess: (response) => {
            setTimeout(() => {
                setIsLoading(false)
                setIsSuccessMessage(true)
                setMessageContent(response?.data?.data?.message)
                refetch();
                onCategoryChange();
            }, 2000);
            setIsHappened(true)
        },
        onError: (error) => {
            setIsErrorMessage(true)
            setLoadingImage(true)
            setMessageContent(error.message || "An error occurred.")
        },
    })

    const renderInput = () => {
        return (
            <Tooltip title="Type New Category & Press enter">
                <Input
                    ref={form}
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder={labels?.menuCategoryPlaceholder}
                    onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Enter") {
                            addItem(e)
                        }
                    }}
                />
            </Tooltip>
        )
    }
    const triggerUploadmenu = useMutation({
        mutationFn: (data) => {
            return menuApiUtil.post(`/menu/${userInfo?.clientInfo?.clientCode}${EndPoints.uploadMenu}`, data, {
                headers: { "Content-Type": "multipart/form-data" },
            });
        },
        onSuccess: (response) => {
            setTimeout(() => {
                setLoadingImage(false); 
            }, 2000);
            const baseUrl = "https://quickbiteqr.com";
            const filePath = response?.data?.data?.fileUrl;
            const fullImageUrl = `${baseUrl}/menu-images${filePath}`;
            setNewMenu({
                ...newMenu,
                image: fullImageUrl, // Set the full URL here
            });
        },
        onError: (error) => {
            setLoadingImage(false);
            setIsSuccessMessage(false);
            setIsErrorMessage(true);
            setMessageContent(error?.response?.data)
        },
    });

    return (
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
            <Form.Item
                label={labels?.menuName}
                name="menuName"
                rules={[{ required: true, message: labels?.menuNameRequired }]}
                className={styles.inputStyle}
            >
                <Input
                    value={newMenu.menuName}
                    onChange={(e) => handleChange("menuName", e.target.value)}
                />
            </Form.Item>

            <Form.Item
                label={labels?.menuCategory}
                name="menuCategory"
                rules={[
                    { required: true, message: labels?.menuCategoryRequired },
                ]}
                className={styles.inputStyle}
            >
                <Select
                    placeholder={labels?.menuCategoryPlaceholder}
                    dropdownRender={(menu) => (
                        <>
                            {renderInput()}
                            <Divider style={{ margin: "0.5rem 0" }} />
                            {isLoading ? (
                                <ConfigProvider
                                    theme={{
                                        cssVar: true,
                                        components: {
                                            Spin: {
                                                colorPrimary:
                                                    designPatterns.buttonPrimary,
                                            },
                                        },
                                    }}
                                >
                                    <div className={styles.spinContainer}>
                                        <Spin size="large" />
                                    </div>{" "}
                                </ConfigProvider>
                            ) : null}
                            {menu}
                        </>
                    )}
                    options={items.map((item) => ({
                        label: item?.name,
                        value: item?.categoryCode,
                    }))}
                    onChange={(value) => handleChange("menuCategory", value)}
                />
            </Form.Item>
            <Form.Item
                label={labels?.price}
                name="price"
                rules={[
                    {
                        required: true,
                        message: labels?.priceRequired,
                    },
                    {
                        type: "number",
                        min: 0.01,
                        message: labels?.pricePositiveNumber,
                    },
                ]}
                className={styles.inputStyle}
            >
                <InputNumber
                    value={newMenu.price}
                    prefix="₹"
                    min={0}
                    step={1}
                    controls={false}
                    onChange={(value) => {
                        // Ensuring only valid numeric values are allowed
                        if (value !== "" && !isNaN(value)) {
                            handleChange("price", value)
                        } else {
                            handleChange("price", 0) // Reset to 0 if invalid input
                        }
                    }}
                    onBlur={() => {
                        if (newMenu.price === "") {
                            handleChange("price", 0)
                        }
                    }}
                    onKeyPress={(e) => {
                        // Allow only numbers (including decimal point)
                        if (!/[0-9.]/.test(e.key)) {
                            e.preventDefault()
                        }
                    }}
                />
            </Form.Item>
            <Form.Item
                label={labels?.offerPct}
                name="offerPct"
                className={styles.inputStyle}
            >
                <InputNumber
                    value={newMenu.offerPct}
                    min={0}
                    step={1}
                    suffix="%"
                    controls={false}
                    onChange={(value) => {
                        if (value !== "" && !isNaN(value)) {
                            handleChange("offerPct", value)
                        } else {
                            handleChange("offerPct", 0)
                        }
                    }}
                    onBlur={() => {
                        if (newMenu.offerPct === "") {
                            handleChange("offerPct", 0)
                        }
                    }}
                    onKeyPress={(e) => {
                        if (!/[0-9.]/.test(e.key)) {
                            e.preventDefault()
                        }
                    }}
                />
            </Form.Item>

            <Form.Item
                label={labels?.menuDescription}
                name="menuDescription"
                rules={[
                    {
                        required: true,
                        message: labels?.menuDescriptionRequired,
                    },
                ]}
                className={styles.inputStyle}
            >
                <Input
                    value={newMenu.menuDescription}
                    onChange={(e) =>
                        handleChange("menuDescription", e.target.value)
                    }
                />
            </Form.Item>

            <Form.Item
                name="image"
                rules={[
                    {
                        required: true,
                    },
                    () => ({
                        validator() {
                            if (newMenu.image === uploadImage) {
                                return Promise.reject(
                                    new Error(labels?.imageRequired)
                                )
                            }
                            return Promise.resolve()
                        },
                    }),
                ]}
            >
                <div className={styles.uploadContainer}>
                    <button
                        type="button"
                        className={styles.buttonImage}
                        onClick={() =>
                            document.getElementById("file-input").click()
                        }
                    >
                        {loadingImage ? (
                            <ConfigProvider
                                theme={{
                                    cssVar: true,
                                    components: {
                                        Spin: {
                                            colorPrimary:
                                                designPatterns.buttonPrimary,
                                        },
                                    },
                                }}
                            >
                                <Spin size="large" />
                            </ConfigProvider>
                        ) : (
                            <img
                                src={newMenu.image}
                                alt="food"
                                className={styles.buttonImage}
                            />
                        )}
                    </button>
                    <CustomFileInput
                        id="file-input"
                        onChange={handleImageUpload}
                    />
                </div>
            </Form.Item>

            <Form.Item className={styles.addButton}>
                <Button
                    type="primary"
                    label={labels?.addToList}
                    onClick={handleSubmit}
                    id="add-drawer"
                    style={{ width: stylesVariable.widthCentPercent }}
                />
            </Form.Item>
            {/* Custom Message Component */}
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
        </Form>
    )
}

export default AddMenuDrawer
