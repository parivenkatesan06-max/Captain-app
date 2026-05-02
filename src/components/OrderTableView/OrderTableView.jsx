import React, { useEffect, useMemo, useState } from "react"
import { Table, Flex, Form, Select, Input, message } from "antd"
import Button from "../Button/Button"
import styles from "./OrderTableView.module.scss"
import NumberInput from "../NumberInput/NumberInput"
import {
    CheckCircleFilled,
    CheckCircleOutlined,
    DeleteOutlined,
    EditOutlined,
    UndoOutlined,
} from "@ant-design/icons"
import ModalContent from "../ModalContent/ModalContent"
import { useNavigate } from "react-router-dom"
import Breadcurmbs from "../Breadcrumbs/Breadcurmbs"
import { ROLES } from "../../utility/constants"
import designPatterns from "../../styles/base/_variables.module.scss";
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"


const OrderTableView = ({ initialDataSource, userInfo, tablePagebreadcrumbs }) => {
    const [data, setData] = useState([])
    const [editingKeys, setEditingKeys] = useState([])
    const [editingRows, setEditingRows] = useState({})
    const [isAnyRowEdited, setIsAnyRowEdited] = useState(false)
    const [open, setOpen] = useState(false)
    const [reason, setReason] = useState("")
    const [additionalInfo, setAdditionalInfo] = useState("")
    const [itemToEdit, setItemToEdit] = useState(null)
    const [actionType, setActionType] = useState("")
    const [selectedItems, setSelectedItems] = useState([])
 
    const isEditing = (record) => editingKeys.includes(record.id)

    const navigate = useNavigate()
    const [form] = Form.useForm()

    const handleCheckboxChange = (id) => {
        const updatedSelectedItems = selectedItems.includes(id)
            ? selectedItems.filter((item) => item !== id)
            : [...selectedItems, id]

        setSelectedItems(updatedSelectedItems)
        setIsAnyRowEdited(updatedSelectedItems.length > 0)
    }

    useEffect(() => {
        setData(initialDataSource)
    }, [initialDataSource])

    const handleEdit = (id) => {
        setEditingKeys((prevEditingKeys) => {
            return [...prevEditingKeys, id]
        })

        setEditingRows((prev) => ({
            ...prev,
            [id]: { ...data.find((item) => item.id === id) },
        }))
    }
    const handleEditUndo = (record) => {
        setEditingRows((prev) => {
            const updatedRows = { ...prev }
            updatedRows[record.id].quantity = data.find(
                (item) => item.id === record.id
            ).quantity
            return updatedRows
        })
        setEditingKeys(editingKeys.filter((id) => id !== record.id))
    }

    const handleQuantityChange = (id, quantity) => {
        const currentItem =
            editingRows[id] || data.find((item) => item.id === id)

        const unitPrice = currentItem.price / currentItem.quantity
        const updatedItem = {
            ...currentItem,
            quantity: quantity >= 1 ? quantity : 1,
            price: (quantity >= 1 ? quantity : 1) * unitPrice,
        }

        setEditingRows((prev) => ({
            ...prev,
            [id]: updatedItem,
        }))
    }

    useEffect(() => {
        setIsAnyRowEdited(isAnyQuantityChanged)
    }, [editingRows])

    const isAnyQuantityChanged = () => {
        return Object.keys(editingRows).some((id) => {
            const editingItem = editingRows[id]
            const originalItem = data.find((item) => item.id === id)
            const hasDeletedItems = data.some(item => item.isDeleted)

            return (
                editingItem &&
                originalItem &&
                hasDeletedItems ||
                editingItem.quantity !== originalItem.quantity
            )
        })
    }

    const handleCancel = (id) => {
        navigate("/table")
        setEditingRows((prev) => {
            const updatedRows = { ...prev }
            delete updatedRows[id]
            return updatedRows
        })
        setIsAnyRowEdited(editingKeys.length > 1)
    }
    const handleSave = () => {
        form.submit()
        message.success("Order details updated successfully")
        navigate("/table")
    }
    const onFormFinish = () => {
        const updatedData = data
            .map((item) => (editingRows[item.id] ? editingRows[item.id] : item))
            .filter((item) => !item.isDeleted)
        setEditingKeys([])
        setData(updatedData)
        setEditingRows({})
        setIsAnyRowEdited(false)
        setOpen(false)
        setReason(" ")
        setAdditionalInfo(" ")
        form.resetFields()
    }
    const handleSaveClick = (id) => {
        if (userInfo.role === ROLES.CAPTAIN) {
            const payload = data.filter((item) =>
                selectedItems.includes(item.id)
            )
            console.log("Payload:", payload)
            navigate("/table")
        } else {
            setItemToEdit(id)
            setActionType("save")
            setOpen(true)
        }
    }
    const handleDeleteClick = (id) => {
        setItemToEdit(id)
        setOpen(true)
        setActionType("delete")
    }

    const handleOndelete = () => {
        setData((prevData) =>
            prevData.map((item) =>
                item.id === itemToEdit ? { ...item, isDeleted: true } : item
            )
        )
        setOpen(false)
        setIsAnyRowEdited(true)
    }

    const handleOnCancel = () => {
        setOpen(false)
        form.resetFields()
    }

    const secondaryButtonLabel = actionType === "delete" ? "Delete" : "Submit"
    const secondaryOnClick =
        actionType === "delete" ? handleOndelete : handleSave
    const primaryButtonLabel = "Cancel"
    const primaryOnClick = handleOnCancel

    const content = () => {
        if (actionType === "delete") {
            return (
                <Flex justify="center">
                    <span>Are you sure you want to delete this item?</span>
                </Flex>
            )
        }
        return (
            <Form form={form} layout="vertical" onFinish={onFormFinish}>
                <Form.Item
                    name="reason"
                    label="Reason for Modification"
                    rules={[
                        {
                            required: true,
                            message: "Please select a reason!",
                        },
                    ]}
                >
                    <Select
                        value={reason}
                        onChange={(value) => setReason(value)}
                        placeholder="Select a reason"
                    >
                        <Select.Option value="change_of_mind">
                            Change of Mind
                        </Select.Option>
                        <Select.Option value="item_damage">
                            Food Qualiity
                        </Select.Option>
                        <Select.Option value="wrong_item">
                            Wrong Item Received
                        </Select.Option>
                        <Select.Option value="other">Other</Select.Option>
                    </Select>
                </Form.Item>
                {reason === "other" && (
                    <Form.Item
                        name="otherReason"
                        label="Please provide more details"
                        rules={[
                            {
                                required: true,
                                message: "Please provide more information!",
                            },
                        ]}
                    >
                        <Input.TextArea
                            value={additionalInfo}
                            onChange={(e) => setAdditionalInfo(e.target.value)}
                            placeholder="Provide more details"
                        />
                    </Form.Item>
                )}
            </Form>
        )
    }

    const getRowSpan = () => {
        const spanMap = {}
        let lastTitle = null
        let count = 0
        let startIndex = -1

        data.forEach((item, index) => {
            if (item.menuName === lastTitle) {
                count += 1
            } else {
                if (lastTitle !== null) {
                    spanMap[startIndex] = count
                }
                lastTitle = item.menuName
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

    const columns = [
        {
            title: "Title",
            dataIndex: "menuName",
            onCell: (row, index) => {
                const rowSpan = rowSpanMap[index] || 0
                return {
                    rowSpan: rowSpan,
                }
            },
            render: (text) => text, // Keep the render function simple for cell content only
        },
        {
            title: "Category",
            dataIndex: "menuCategory",
            render: (text, record) =>
                record.isDeleted ? (
                    <StrikethroughText>{text}</StrikethroughText>
                ) : (
                    text
                ),
        },
        {
            title: "Quantity",
            dataIndex: "quantity",
            align: "center",
            render: (text, record) =>
                record.isDeleted ? (
                    <StrikethroughText>{text}</StrikethroughText>
                ) : isEditing(record) ? (
                    <Flex justify="center">
                        <NumberInput
                            style={{width:stylesVariable.numberInputWidthOrderTable}}
                            bgColor={designPatterns.inputNumberBgColor}
                            textColor={designPatterns.inputNumberTextColor}
                            count={
                                editingRows[record.id]?.quantity ??
                                record.quantity
                            }
                            decrement={() =>
                                handleQuantityChange(
                                    record.id,
                                    (editingRows[record.id]?.quantity ||
                                        record.quantity) - 1
                                )
                            }
                            increment={() =>
                                handleQuantityChange(
                                    record.id,
                                    (editingRows[record.id]?.quantity ||
                                        record.quantity) + 1
                                )
                            }
                            onChange={(value) =>
                                handleQuantityChange(record.id, value)
                            }
                        />
                    </Flex>
                ) : (
                    <span>{record.quantity}</span>
                ),
        },
        {
            title: "Price",
            dataIndex: "price",
            align: "center",
            render: (_, record) => {
                const price = isEditing(record)
                    ? editingRows[record.id]?.price
                    : record.price
                return record.isDeleted ? (
                    <StrikethroughText>₹ {price}</StrikethroughText>
                ) : (
                    `₹ ${price}`
                )
            },
        },
        {
            title: "Actions",
            align: "center",
            render: (_, record) => {
                const editable = isEditing(record)

                if (userInfo.role === ROLES.CAPTAIN) {
                    return selectedItems.includes(record.id) ? (
                        <CheckCircleFilled
                            style={{ color: designPatterns.tableIconColor, fontSize: stylesVariable.iconFontSize }}
                            onClick={() => handleCheckboxChange(record.id)}
                        />
                    ) : (
                        <CheckCircleOutlined
                            style={{ color: designPatterns.tableIconColor, fontSize: stylesVariable.iconFontSize }}
                            onClick={() => handleCheckboxChange(record.id)}
                        />
                    )
                }

                const renderEditIcon = () =>
                    editable && !record.isDeleted ? (
                        <UndoOutlined
                            onClick={() => handleEditUndo(record)}
                            className={styles.undoIcon}
                        />
                    ) : (
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

    const calculateTotals = () => {
        let subtotal = 0
        let itemCount = 0

        data.forEach((item) => {
            if (!item.isDeleted) {
                const price = editingRows[item.id]?.price || item?.price

                subtotal += price
                itemCount++
            }
        })
        const gstRate = 0.09 // 9% for CGST and SGST
        const cgst = subtotal * gstRate
        const sgst = subtotal * gstRate
        const grandTotal = subtotal + cgst + sgst

        return {
            subtotal,
            cgst,
            sgst,
            grandTotal,
            itemCount,
        }
    }

    const { subtotal, cgst, sgst, grandTotal, itemCount } = useMemo(
        calculateTotals,
        [data, editingRows]
    )

    return (
        <div className={styles.tableContainer}>
            {userInfo.role === ROLES.CAPTAIN && (
                <Breadcurmbs items={tablePagebreadcrumbs} separator=">" />
            )}
            <Table
                bordered
                borderColor={designPatterns.buttonPrimary}
                dataSource={data.map((item) => ({ ...item, key: item.id }))}
                columns={columns}
                pagination={false}
                scroll={{ y: 523 }}
                className={styles.table}
            />
            <ModalContent
                closeIcon={null}
                open={open}
                content={content()}
                primaryButtonLabel={primaryButtonLabel}
                primaryOnClick={primaryOnClick}
                secondaryButtonLabel={secondaryButtonLabel}
                secondaryOnClick={secondaryOnClick}
            />
            <Flex align="flex-end" justify="flex-end">
                <div
                    className={styles.summaryContainer}
                >
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>Items:</div>
                        <div>{itemCount}</div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>Subtotal:</div>
                        <div>{`INR ${subtotal.toFixed(2)}`}</div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>CGST (9%):</div>
                        <div>{`₹ ${cgst.toFixed(2)}`}</div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>SGST(9%):</div>
                        <div>{`₹ ${sgst.toFixed(2)}`}</div>
                    </div>
                    <div
                        style={{
                            display: "flex",
                            justifyContent: "space-between",
                        }}
                    >
                        <div>Total:</div>
                        <div>{`₹ ${grandTotal.toFixed(2)}`}</div>
                    </div>
                </div>
            </Flex>
            <Flex justify="end" gap="0.5rem" className={styles.buttonContainer} >
                <Button label="Cancel" onClick={handleCancel} />
                <Button
                    type="primary"
                    onClick={() => isAnyRowEdited && handleSaveClick()}
                    label="Save"
                    style={getIconStyle(!isAnyRowEdited)}
                />
            </Flex>
        </div>
    )
}

export default OrderTableView

const getIconStyle = (isDeleted, isAnyRowEdited) => ({
    cursor: isDeleted || isAnyRowEdited ? "not-allowed" : "pointer",
    opacity: isDeleted || isAnyRowEdited ? 0.5 : 1,
})

const StrikethroughText = ({ children }) => {
    return <span className={styles.strikethrough}>{children}</span>
}
