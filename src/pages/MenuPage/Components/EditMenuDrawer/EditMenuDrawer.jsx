import React, { useEffect, useState } from "react"
import { Input, Select, InputNumber, Form, Divider, ConfigProvider, Spin } from "antd"
import styles from "./EditMenuDrawer.module.scss"
import Button from "../../../../components/Button/Button"
import { CustomFileInput } from "../AddMenuTable/AddMenuTableUtils"
import labels from "./EditMenuDrawer.label.json"
import stylesVariable from "../../../../styles/base/_stylesVariable.module.scss"
import { getUserInfo } from "../../../../utility/userInfo"
import ApiUtil from "../../../../utility/ApiUtil"
import EndPoints from "../../../../utility/EndPoints"
import { useMutation, useQuery } from "@tanstack/react-query"
import designPatterns from "../../../../styles/base/_variables.module.scss"
import CustomMessage from "../../../../components/CustomMessage/CustomMessage"


const EditMenuDrawer = ({ category, onSave, menuData, isEditDrawerVisible, setIsHappened, onCategoryChange }) => {
    const [form] = Form.useForm();
    const initialMenuState = {
        menuName: menuData?.menuName,
        menuCategory: menuData?.categoryName,
        price: menuData?.price,
        image: menuData?.menuImageUrl,
        id: menuData?.menuId,
        offerPct: menuData?.offerPct,
        menuDescription: menuData?.menuDescription
    }

    const [newMenu, setNewMenu] = useState(null)
    const [item, setItem] = useState("")
    const [items, setItems] = useState(category)
    const menuApiUtil = new ApiUtil();
    const userInfo = getUserInfo()
    const [isLoading, setIsLoading] = useState(false)
    const [isErrorMessage, setIsErrorMessage] = useState(false)
    const [isSuccessMessage, setIsSuccessMessage] = useState(false)
    const [messageContent, setMessageContent] = useState("")
    const [loadingImage, setLoadingImage] = useState(false)
    
    useEffect(() => {
        if(!isEditDrawerVisible){
            form.resetFields()
        } else{
            setNewMenu(initialMenuState)
        }

    }, [isEditDrawerVisible])

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

    useEffect(() => {
        if (form) {
            form.setFieldsValue(newMenu)
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
            triggerUploadmenu.mutate(formData)
        }
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

    // Handle form submission with validation
    const handleSubmit = async () => {
        try {
            // Get all form field values
            const formValues = form.getFieldsValue();

            // Convert price to number and ensure it's valid
            formValues.price = Number(formValues.price);
            if (isNaN(formValues.price)) {
                formValues.price = 0;
            }

            // Set the form values before validation
            form.setFieldsValue(formValues);

            // Validate the form
            await form.validateFields();

            // Find and return the categoryCode if formValue.categoryCode matches with any item's name
            const categoryCode = onLoadDataCategory?.data?.data?.find(
                item => item.name === formValues.menuCategory
            )?.categoryCode || formValues.menuCategory;

            // If validation passes, call onSave with the validated values and categoryCode as separate parameter
            onSave({
                ...newMenu,
                ...formValues,
            }, categoryCode);

            // Reset the form fields and state after submission
            form.resetFields();
            setNewMenu({ id: menuData?.menuId, ...formValues });
        } catch (error) {
            console.log("Validation failed:", error);
        }
    };

    const addItem = (e) => {
        e.preventDefault()
        setItem("")
        const data = {
            name: item,
            clientCode: userInfo?.clientInfo?.clientCode,
        }
        setIsLoading(true)
        triggerAddCategory.mutate(data)
    }
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
            setMessageContent(error.message || "An error occurred.")
        },
    })

    const renderInput = () => {
        return (
            <Input
                ref={form}
                value={item}
                onChange={(e) => setItem(e.target.value)}
                placeholder={"Add Menu Category"}
                onKeyDown={(e) => {
                    e.stopPropagation()
                    if (e.key === "Enter") {
                        addItem(e)
                    }
                }}
            />
        )
    }

    return (
        <>
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item
                    label={labels?.menuName} // Use the label from the JSON file
                    name="menuName"
                    rules={[
                        { required: true, message: "Menu name is required" },
                    ]}
                    className={styles.inputStyle}
                >
                    <Input
                        value={newMenu?.menuName}
                        onChange={(e) =>
                            handleChange("menuName", e.target.value)
                        }
                    />
                </Form.Item>

                <Form.Item
                    label={labels?.menuCategory} // Use the label from the JSON file
                    name="menuCategory"
                    rules={[
                        { required: true, message: "Please select a category" },
                    ]}
                    className={styles.inputStyle}
                >
                    <Select
                        placeholder="Enter Menu Category"
                        dropdownRender={(menu) => (
                            <>
                                {renderInput(category)}
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
                        onChange={(value) =>
                            handleChange("menuCategory", value)
                        }
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
                            min: 0,
                            message: labels?.pricePositiveNumber,
                        },
                    ]}
                    className={styles.inputStyle}
                >
                    <InputNumber
                        value={newMenu?.price}
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
                            if (newMenu?.price === "") {
                                handleChange("price", 0)
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
                        value={newMenu?.offerPct}
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
                        value={newMenu?.menuDescription}
                        onChange={(e) =>
                            handleChange("menuDescription", e.target.value)
                        }
                    />
                </Form.Item>

                <Form.Item
                    name="image"
                    shouldUpdate={(prevValues, currentValues) => prevValues.image !== currentValues.image}
                >
                    <div className={styles.uploadContainer}>
                        <button
                            type="button"
                            className={styles.buttonImage}
                            onClick={() =>
                                document
                                    .getElementById("file-input-edit")
                                    .click()
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
                                    src={newMenu?.image}
                                    alt="food"
                                    className={styles.buttonImage}
                                />
                            )}
                        </button>
                        <CustomFileInput
                            id="file-input-edit"
                            onChange={handleImageUpload}
                        />
                    </div>
                </Form.Item>

                <Form.Item className={styles.addButton}>
                    <Button
                        type="primary"
                        label="Save Changes"
                        onClick={handleSubmit}
                        style={{width: stylesVariable.widthCentPercent}}
                        id="edit-drawer"
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
        </>
    )
}

export default EditMenuDrawer
