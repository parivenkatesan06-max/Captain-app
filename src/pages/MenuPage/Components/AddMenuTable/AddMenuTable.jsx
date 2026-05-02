import React, { useState, useRef } from "react"
import {
    Table,
    Input,
    Select,
    Divider,
    ConfigProvider,
    Form,
    message,
    Flex,
} from "antd"
import uploadImage from "../../../../assets/Image/uploadImage.svg"
import { CustomFileInput } from "./AddMenuTableUtils"
import Button from "../../../../components/Button/Button"
import styles from "./AddMenuTable.module.scss"
import designPattern from "../../../../styles/base/_variables.module.scss"
import labels from "./AddMenuTable.label.json"
import NumberInput from "../../../../components/NumberInput/NumberInput"
// import EndPoints from "../../../../utility/EndPoints"
// import ApiUtil from "../../../../utility/ApiUtil"
// import { useMutation } from "@tanstack/react-query"
import Toast from "../../../../components/Toast/Toast"



const AddMenuTable = ({ Category, toggleTableVisibility, onSave }) => {
    const [data, setData] = useState([
        {
            key: "1",
            title: "",
            category: "",
            quantity: 1,
            image: uploadImage,
            price: "",
        },
    ])

    const [savedData, setSavedData] = useState([])
    const [item, setItem] = useState("")
    const [items, setItems] = useState(Category)
    const inputRef = useRef(null)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")


    // const addMenuApiUtil = new ApiUtil()

    const handleInputChange = (key, field, value) => {
        setData((prevData) =>
            prevData.map((item) =>
                item.key === key ? { ...item, [field]: value } : item
            )
        )
    }

    const handleImageUpload = (e, key) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader()
            reader.onloadend = () => {
                const updatedData = [...data];
                const rowIndex = updatedData.findIndex((item) => item.key === key);
                if (rowIndex > -1) {
                    const currentRow = updatedData[rowIndex];
                    // If the row does not have an image (first time upload), we add a new row below
                    if (!currentRow.image || currentRow.image === uploadImage) {
                        updatedData[rowIndex] = {
                            ...currentRow,
                            image: reader.result, 
                        };
                        // Add a new row below the current row (first time image upload)
                        const newRow = {
                            key: `${Date.now()}`,
                            title: "",
                            category: "",
                            quantity: 1,
                            price: "",
                            image: uploadImage,
                        };
                        updatedData.splice(rowIndex + 1, 0, newRow); 
                    } else {
                        // If the row already has an image (re-upload), just update the image without adding a new row
                        updatedData[rowIndex] = {
                            ...currentRow,
                            image: reader.result,
                        };
                    }
                }
    
                setData(updatedData);
            };
            reader.readAsDataURL(file);
        }
    };

    // For real endpoint post call update
    // async function saveDataValidation(payload) {
    //     return addMenuApiUtil.post(EndPoints.addNewMenu,payload);
    // }

    // // Then, set up the mutation hook for saving data
    // const saveDataMutation = useMutation({
    //     mutationFn: saveDataValidation,
    //     onSuccess: (data) => {
    //         console.log("Data saved successfully:", data);
    //         // Assuming you want to toggle visibility and reset data after a successful save
    //         toggleTableVisibility();
    //         setData([
    //             {
    //                 key: `${Date.now()}`,
    //                 title: "",
    //                 category: "",
    //                 quantity: 1,
    //                 price: "",
    //                 image: uploadImage,
    //             },
    //         ]);
    //         setItem("");
    //     },
    //     onError: (error) => {
    //         console.error("Error saving data:", error);
    //         message.error(`Error saving data: ${error.message}`);
    //     },
    // });

    // const handleSave = async () => {
    //     try {
    //         // Filter out rows that have incomplete or invalid data
    //         const newSavedData = data.filter((item) => {
    //             // Ensure all required fields are filled
    //             const isValidTitle = item.title.trim();
    //             const isValidCategory = item.category.trim();
    //             const isValidPrice = item.price.trim() && !isNaN(item.price);
    
    //             // Optionally, check if an image is uploaded (if it's a required field)
    //             const isValidImage = item.image !== uploadImage; // Check if image is uploaded
    
    //             return isValidTitle && isValidCategory && isValidPrice && isValidImage;
    //         });
    
    //         // If no valid data to save, show an error
    //         if (newSavedData.length === 0) {
    //             message.error(labels?.pleaseCompleteFields);
    //             return;
    //         }
    
    //         // Prepare the payload for the API call
    //         const payload = newSavedData.map((item) => ({
    //             menuName: item.category,
    //             menuCategory: item.title,
    //             price: parseFloat(item.price),
    //             currency: "INR",
    //             menuImageUrl: item.image,
    //             offerName: item.offerName || "special",
    //             offerPercent: item.offerPercent || "0",
    //             offerPrice: (
    //                 parseFloat(item.price) *
    //                 (1 - parseFloat(item.offerPercent || 0) / 100)
    //             ).toFixed(2),
    //             quantity: item.quantity.toString(),
    //         }));
    
    //         console.log("Payload to be sent to the server:", payload);
    
    //         // Call the mutation to save the data
    //         onSave(payload); // Assuming this is a prop function to handle save
    //         saveDataMutation.mutate(payload);
    
    //         // Reset the table after successful save
    //         toggleTableVisibility();
    //         setData([{
    //             key: `${Date.now()}`,
    //             title: "",
    //             category: "",
    //             quantity: 1,
    //             price: "",
    //             image: uploadImage,
    //         }]);
    //         setItem("");
    //     } catch (error) {
    //         console.error("Error processing data:", error);
    //         message.error(`Error processing data: ${error.message}`);
    //     }
    // };
    

    const handleSave = async () => {
        try {
            const newSavedData = data.filter(
                (item) =>
                    item.title.trim() &&
                    item.category.trim() &&
                    item.price.trim()
            )

            if (newSavedData.length === 0) {
                setToastMessage(labels?.pleaseCompleteFields)
                setShowToast(true)
                return;
            }

            const payload = newSavedData.map((item) => ({
                menuName: item.category,
                menuCategory: item.title,
                price: parseFloat(item.price),
                currency: "INR",
                menuImageUrl: item.image, // Assuming 'image' holds the URL
                offerName: item.offerName || "special",
                offerPercent: item.offerPercent || "0",
                offerPrice: (
                    parseFloat(item.price) *
                    (1 - parseFloat(item.offerPercent || 0) / 100)
                ).toFixed(2),
                quantity: item.quantity.toString(),
            }))

            console.log("Payload to be sent to the server:", payload)

            onSave(payload)
            toggleTableVisibility()

            setData([
                {
                    key: `${Date.now()}`,
                    title: "",
                    category: "",
                    quantity: 1,
                    price: "",
                    image: uploadImage,
                },
            ])

            setItem("")
            setSavedData([])
        } catch (error) {
            console.error("Error saving data:", error)
            message.error(`Error saving data: ${error.message}`)
            console.log(savedData)
        }
    }

    const addItem = (e) => {
        e.preventDefault()
        setItem("")
        setItems([...items, item])
        setTimeout(() => {
            inputRef.current?.focus()
        }, 0)
    }

    const renderInput = () => {
        return (
            <ConfigProvider
                theme={{
                    token: {
                        colorTextPlaceholder: designPattern.tableBgColor,
                        colorText: designPattern.tableBgColor,
                        colorBgContainer: designPattern.buttonPrimary,
                        colorBorder: designPattern.buttonPrimary,
                        borderRadius: "0px",
                    },
                }}
            >
                <Input
                    ref={inputRef}
                    value={item}
                    onChange={(e) => setItem(e.target.value)}
                    placeholder={labels?.inputTitlePlaceholder}
                    onKeyDown={(e) => {
                        e.stopPropagation()
                        if (e.key === "Enter") {
                            addItem(e)
                        }
                    }}
                />
            </ConfigProvider>
        )
    }

    const columns = [
        {
            title: labels?.title,
            dataIndex: "title",
            key: "title",
            align: "center",
            width: "25%",
            render: (text, record) => {
                const isRowEmpty =
                    !record.title.trim() &&
                    !record.category.trim() &&
                    !record.price.trim()

                return (
                    <Form.Item
                        name={[record.key, "title"]}
                        initialValue={text}
                        rules={[
                            {
                                required: !isRowEmpty,
                                message: `Please input the ${labels?.title.toLowerCase()}!`,
                            },
                        ]}
                    >
                        <Select
                            style={{ height: "2.5rem" }}
                            placeholder="Title"
                            dropdownRender={(menu) => (
                                <>
                                    {renderInput(record)}
                                    <Divider style={{ margin: "0.5rem 0" }} />
                                    {menu}
                                </>
                            )}
                            options={items.map((item) => ({
                                label: item,
                                value: item,
                            }))}
                            onChange={(value) =>
                                handleInputChange(record.key, "title", value)
                            }
                        />
                    </Form.Item>
                )
            },
        },
        {
            title: labels?.category,
            dataIndex: "category",
            key: "category",
            align: "center",
            width: "25%",
            render: (text, record) => {
                const isRowEmpty =
                    !record.title.trim() &&
                    !record.category.trim() &&
                    !record.price.trim()

                return (
                    <Form.Item
                        name={[record.key, "category"]}
                        initialValue={text}
                        rules={[
                            {
                                required: !isRowEmpty,
                                message: `Please input the ${labels?.category.toLowerCase()}!`,
                            },
                        ]}
                    >
                        <Input
                            placeholder={labels?.inputCategoryPlaceholder}
                            value={text}
                            style={{ height: "2.5rem" }}
                            autoComplete="off"
                            onChange={(e) =>
                                handleInputChange(
                                    record.key,
                                    "category",
                                    e.target.value
                                )
                            }
                        />
                    </Form.Item>
                )
            },
        },
        {
            title: labels?.quantity,
            dataIndex: "quantity",
            key: "quantity",
            align: "center",
            width: "15%",
            render: (text, record) => {
                const isRowEmpty =
                    !record.title.trim() &&
                    !record.category.trim() &&
                    !record.price.trim()

                const increment = () => {
                    const newValue = (record.quantity || 0) + 1
                    handleInputChange(record.key, "quantity", newValue)
                }

                const decrement = () => {
                    const newValue = Math.max((record.quantity || 1) - 1, 1)
                    handleInputChange(record.key, "quantity", newValue)
                }

                return (
                    <Flex justify="center">
                        <Form.Item
                            name={[record.key, "quantity"]}
                            initialValue={text}
                            rules={[
                                {
                                    required: !isRowEmpty,
                                    message: `Please input ${labels?.quantity.toLowerCase()}!`,
                                },
                            ]}
                        >
                            <NumberInput
                                style={{ width: "5rem" }}
                                bgColor={designPattern.buttonPrimary}
                                textColor={designPattern.inputNumberTextColor}
                                count={text}
                                decrement={decrement}
                                increment={increment}
                                onChange={(text) =>
                                    handleInputChange(record.key, "quantity", text)
                                }
                            />
                        </Form.Item>
                    </Flex>
                )
            },
        },
        {
            title: labels?.price,
            dataIndex: "price",
            key: "price",
            align: "center",
            width: "20%",
            render: (text, record) => {
                const isRowEmpty =
                    !record.title.trim() &&
                    !record.category.trim() &&
                    !record.price.trim()

                return (
                    <Form.Item
                        name={[record.key, "price"]}
                        initialValue={text}
                        rules={[
                            {
                                required: !isRowEmpty,
                                message: `Please input the ${labels?.price.toLowerCase()}!`,
                            },
                            {
                                pattern: /^[0-9]*\.?[0-9]+$/, 
                                message: "Please enter a valid price!",
                            },
                        ]}
                    >
                        <Input
                            placeholder={labels?.inputPricePlaceholder}
                            value={text}
                            style={{ height: "40px" }}
                            onChange={(e) =>
                                handleInputChange(record.key, "price", e.target.value)
                            }
                            type="text"
                            onInput={(e) => {
                                const value = e.target.value;
                                if (!/^\d*\.?\d*$/.test(value)) {
                                    e.preventDefault();
                                }
                            }}
                        />
                    </Form.Item>
                );
            },
        },
        {
            title: labels?.image,
            dataIndex: "image",
            key: "image",
            align: "center",
            width: "15%",
            render: (imageSrc, record) => (
                <div style={{ position: "relative", display: "inline-block" }}>
                    {imageSrc === uploadImage ? (
                        <button
                            type="button"
                            className={styles.buttonImage}
                            onClick={() =>
                                document
                                    .getElementById(`file-input-${record.key}`)
                                    .click()
                            }
                            aria-label= {labels?.uploadImage}
                        >
                            <img
                                src={uploadImage}
                                alt="food"
                            />
                        </button>
                    ) : (
                        <button
                            type="button"
                            className={styles.buttonImage}
                            onClick={() =>
                                document
                                    .getElementById(`file-input-${record.key}`)
                                    .click()
                            }
                            aria-label= {labels?.uploadImage}
                        >
                            <img
                                src={imageSrc}
                                alt="food"
                                style={{
                                    width: 50,
                                    height: 50,
                                    marginRight: 8,
                                }}
                            />
                        </button>
                    )}
                    <CustomFileInput
                        id={`file-input-${record.key}`}
                        onChange={(e) => handleImageUpload(e, record.key)}
                    />
                </div>
            ),
        },
    ]

    return (
        <><Form
            onFinish={handleSave}
            onFinishFailed={() => message.error(labels?.pleaseCompleteFields)}
            className={styles.Container}
        >
            <Table
                columns={columns}
                dataSource={[...data]}
                pagination={false}
                className={styles.tableContainer} />
            <Flex justify="end" gap="0.5rem" className={styles.buttonContainer}>
                <Button
                    key="Cancel"
                    label={labels?.cancelButton}
                    onClick={toggleTableVisibility} />
                <Button
                    key="Save"
                    type="primary"
                    label={labels?.saveButton}
                    htmlType="submit" />
            </Flex>
        </Form>
        <Toast
            message={toastMessage}
            visible={showToast}
            duration={3000}
            onClose={() => setShowToast(false)} // Hide toast on close
        />
        </>
    )
}

export default AddMenuTable
