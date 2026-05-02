import React, { useEffect, useState } from "react"
import { Table, Flex, Form, Select, Input, Drawer, InputNumber } from "antd"
import Button from "../Button/Button"
import styles from "./InventoryTable.module.scss"
// import NumberInput from "../NumberInput/NumberInput"
import { DeleteOutlined, EditOutlined } from "@ant-design/icons"
import ModalContent from "../ModalContent/ModalContent"
import labels from "./InventoryTable.label.json"
import designPatterns from "../../styles/base/_variables.module.scss"
import Toast from "../Toast/Toast"
import ApiUtil from "../../utility/ApiUtil/ApiUtil"
import { useMutation } from "@tanstack/react-query"
import EndPoints from "../../utility/EndPoints"
import { getUserInfo } from "../../utility/userInfo"

const InventoryTable = ({ initialDataSource }) => {
    const [data, setData] = useState([])
    const [open, setOpen] = useState(false)
    const [itemToEdit, setItemToEdit] = useState(null)
    const [actionType, setActionType] = useState("")
    const [isDataChanged, setIsDataChanged] = useState(false)
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [drawerOpen, setDrawerOpen] = useState(false)

    const [form] = Form.useForm()
    const userInfo = getUserInfo()

    useEffect(() => {
        setData(initialDataSource)
    }, [initialDataSource])

    const handleEdit = (id) => {
        const rowData = data.find((item) => item.id === id)
        setItemToEdit(rowData)
        setActionType("edit")
        setDrawerOpen(true)
    }

    const handleCancel = () => {
        setData(initialDataSource)
    }

    const onFormFinish = (values) => {
        const updatedData = data.map((item) => {
            if (item.id === itemToEdit.id) {
                return {
                    ...item,
                    ...values,
                };
            }
            return item
        })
        setShowToast(true)
        setToastMessage(labels?.uploadSuccess)
        setTimeout(() => {
            setShowToast(false)
            setToastMessage("")
            setData(updatedData)
        }, 3000)

        setOpen(false)
        setItemToEdit(null)
        form.resetFields()
    }

    const handleSaveClick = () => {
        setActionType("save")
        setOpen(true)
    }
    const handleDeleteClick = (id) => {
        setItemToEdit(id)
        setOpen(true)
        setActionType("delete")
    }
    const handleSave = () => {
        form.validateFields()
            .then(() => {
                form.submit()
                setDrawerOpen(false)
                setShowToast(true)
                setToastMessage(labels?.editSuccess)

                setTimeout(() => {
                    setShowToast(false)
                    setToastMessage("")
                }, 3000)
                setOpen(false)
            })
            .catch((error) => {
                console.log(error)
            })
    }
    const handleOnCancel = () => {
        setOpen(false)
        setDrawerOpen(false)
        form.resetFields()
    }

    const addInventoryApiUtil = new ApiUtil()

    async function uploadInventoryData(payload) {
        return addInventoryApiUtil.post(
            `${EndPoints.addInventoryList}?entity=${userInfo.entity}`,
            payload
        )
    }

    const triggerUpload = useMutation({
        mutationFn: uploadInventoryData,
        onSuccess: (responseData) => {
            setShowToast(true)
            setToastMessage(labels?.uploadSuccess)
            setData(responseData?.data?.data)
        },
        onError: (error) => {
            setShowToast(true)
            setToastMessage(error)
            console.error(error)
        },
    })
    const handleOnSave = () => {
        triggerUpload.mutate(data)
        setOpen(false)
    }

    useEffect(() => {
        if (itemToEdit) {
            form.setFieldsValue({
                menuCategory: itemToEdit.menuCategory,
                menuName: itemToEdit.menuName,
                unitPrice: itemToEdit.unitPrice,
                quantity: itemToEdit.quantity,
            })
        }
    }, [itemToEdit, form])

    const hasDataChanged = () => {
        if (data.length !== initialDataSource.length) {
            return true
        }
        return data.some((item, index) => {
            const originalItem = initialDataSource[index]
            return (
                item.menuCategory !== originalItem.menuCategory ||
                item.menuName !== originalItem.menuName ||
                item.unitPrice !== originalItem.unitPrice ||
                item.quantity !== originalItem.quantity
            )
        })
    }

    useEffect(() => {
        setIsDataChanged(hasDataChanged())
    }, [data, initialDataSource])

    const handleOndelete = () => {
        const updatedData = data.filter((item) => item.id !== itemToEdit)
        setData(updatedData)
        setOpen(false)
    }

    const secondaryButtonLabel =
        actionType === "delete" ? labels?.deleteButton : labels?.submitButton
    const secondaryOnClick =
        actionType === "delete" ? handleOndelete : handleOnSave
    const primaryButtonLabel = labels?.cancelButton
    const primaryOnClick = handleOnCancel
    const content = () => {
        const deletingItem = data.find((item) => item.id === itemToEdit)
        const deleteConfirmMessage = labels?.deleteConfirmMessage.replace(
            "${items}",
            deletingItem?.menuName
        )
        if (actionType === "delete") {
            return (
                <Flex justify="center">
                    <span>{deleteConfirmMessage}</span>
                </Flex>
            )
        }

        if (actionType === "save") {
            return (
                <Flex justify="center">
                    <span>{labels?.saveConfirmMessage}</span>
                </Flex>
            )
        }
    }

    const getRowSpan = () => {
        const spanMap = {}
        let lastTitle = null
        let count = 0
        let startIndex = -1

        data.forEach((item, index) => {
            if (item.menuCategory === lastTitle) {
                count += 1
            } else {
                if (lastTitle !== null) {
                    spanMap[startIndex] = count
                }
                lastTitle = item.menuCategory
                count = 1
                startIndex = index
            }
        })

        if (startIndex !== -1) {
            spanMap[startIndex] = count
        }

        return spanMap
    }

    const rowSpanMap = getRowSpan()
    const handleKeyPress = (e) => {
        if (e.key === "." || e.key === ",") {
            e.preventDefault();
        }
    };

    const columns = [
        {
            title: "Item Category",
            dataIndex: "menuCategory",
            width: "15%",
            onCell: (row, index) => {
                const rowSpan = rowSpanMap[index] || 0
                return {
                    rowSpan: rowSpan,
                }
            },
            render: (text) => text,
        },
        {
            title: "Item Name",
            dataIndex: "menuName",
            width: "20%",
            render: (text) => text,
        },
        {
            title: "Price per Unit",
            dataIndex: "unitPrice",
            width: "15%",

            render: (text, record) => `₹ ${record.unitPrice}`,
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            align: "center",
            width: "15%",

            render: (text, record) => record.quantity,
        },
        {
            title: "Total Price",
            dataIndex: "price",
            align: "center",
            width: "15%",

            render: (text, record) => `₹ ${record.unitPrice * record.quantity}`,
        },
        {
            title: "Actions",
            align: "center",
            width: "20%",
            render: (_, record) => {
                const renderEditIcon = () => (
                    <EditOutlined
                        onClick={() =>
                            !record.isDeleted && handleEdit(record.key)
                        }
                        className={styles.undoIcon}
                        style={getIconStyle(record.isDeleted)}
                    />
                )

                const renderDeleteIcon = () => {
                    return (
                        <DeleteOutlined
                            onClick={() =>
                                !record.isDeleted &&
                                handleDeleteClick(record.key)
                            }
                            className={styles.undoIcon}
                            style={getIconStyle(record.isDeleted)}
                        />
                    )
                }

                return (
                    <Flex justify="center" gap="0.5rem">
                        {renderEditIcon()}
                        {renderDeleteIcon()}
                    </Flex>
                )
            },
        },
    ]

    return (
        <>
            <ModalContent
                closeIcon={null}
                open={open}
                content={content()}
                primaryButtonLabel={primaryButtonLabel}
                primaryOnClick={primaryOnClick}
                secondaryButtonLabel={secondaryButtonLabel}
                secondaryOnClick={secondaryOnClick}
            />
            {data.length > 0 && (
                <div className={styles.tableContainer}>
                    <Toast
                        message={toastMessage}
                        visible={showToast}
                        duration={3000}
                        onClose={() => setShowToast(false)}
                    />
                    <Table
                        bordered
                        borderColor={designPatterns.buttonPrimary}
                        dataSource={data.map((item) => ({
                            ...item,
                            key: item.id,
                        }))}
                        columns={columns}
                        pagination={false}
                        scroll={{ y: "80%" }}
                        className={styles.table}
                    />
                    <Drawer
                        title={labels?.drawerTitle}
                        open={drawerOpen}
                        onClose={() => setDrawerOpen(false)}
                    >
                        <Form
                            form={form}
                            layout="vertical"
                            onFinish={onFormFinish}
                            initialValues={{
                                menuCategory: itemToEdit?.menuCategory,
                                menuName: itemToEdit?.menuName,
                                unitPrice: itemToEdit?.unitPrice,
                                quantity: itemToEdit?.quantity,
                            }}
                        >
                            <Form.Item
                                name="menuCategory"
                                label="Item Category"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please select a category",
                                    },
                                ]}
                            >
                                <Select placeholder="Select a category">
                                    {[
                                        ...new Set(
                                            data.map(
                                                (item) => item.menuCategory
                                            )
                                        ),
                                    ].map((category) => (
                                        <Select.Option
                                            key={category}
                                            value={category}
                                        >
                                            {category}
                                        </Select.Option>
                                    ))}
                                </Select>
                            </Form.Item>

                            <Form.Item
                                name="menuName"
                                label="Item Name"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a menu name",
                                    },
                                ]}
                            >
                                <Input placeholder="Enter menu name" />
                            </Form.Item>

                            <Form.Item
                                name="unitPrice"
                                label="Price per Unit"
                                rules={[
                                    {
                                        required: true,
                                        message: "Please enter a valid price",
                                    },
                                ]}
                            >
                                <InputNumber
                                    type="number"
                                    controls={false}
                                    placeholder="Enter price per unit"
                                />
                            </Form.Item>

                            <Form.Item
                                name="quantity"
                                label="Quantity"
                                rules={[
                                    {
                                        required: true,
                                        message:
                                            "Please enter a valid quantity",
                                    },
                                ]}
                            >
                                <InputNumber
                                    controls={false}
                                    type="number"
                                    precision={0}
                                    onKeyDown={handleKeyPress}
                                    placeholder="Enter quantity"
                                />
                            </Form.Item>

                            {/* Save and Cancel Buttons */}
                            <Flex justify="space-between">
                                <Button
                                    label="Cancel"
                                    onClick={handleOnCancel}
                                />
                                <Button
                                    type="primary"
                                    onClick={handleSave}
                                    label="Submit"
                                />
                            </Flex>
                        </Form>
                    </Drawer>

                    <Flex
                        justify="end"
                        gap="0.5rem"
                        className={styles.buttonContainer}
                    >
                        <Button
                            label="Cancel"
                            onClick={handleCancel}
                            style={getIconStyle(!isDataChanged)}
                        />
                        <Button
                            type="primary"
                            onClick={() => isDataChanged && handleSaveClick()}
                            label="Save"
                            style={getIconStyle(!isDataChanged)}
                        />
                    </Flex>
                </div>
            ) }
        </>
    )
}

export default InventoryTable

const getIconStyle = (isDeleted, isAnyRowEdited) => ({
    cursor: isDeleted || isAnyRowEdited ? "not-allowed" : "pointer",
    opacity: isDeleted || isAnyRowEdited ? 0.5 : 1,
})
