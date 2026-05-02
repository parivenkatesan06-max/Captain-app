import { Card, ConfigProvider, Flex, Input, Modal, Pagination, Spin } from "antd"
import React, { useEffect, useState, useRef } from "react"
import { DeleteOutlined, EditOutlined, CheckOutlined, CloseOutlined } from "@ant-design/icons"
import { useMutation, useQuery } from "@tanstack/react-query"
import ApiUtil from "../../../../utility/ApiUtil"
import EndPoints from "../../../../utility/EndPoints"
import designPatterns from "../../../../styles/base/_variables.module.scss"
import Button from "../../../../components/Button/Button"
import CustomMessage from "../../../../components/CustomMessage/CustomMessage"
import styles from "./CategoryList.module.scss"
import { ERROR_CODE } from "../../../../utility/constants"
import { getUserInfo } from "../../../../utility/userInfo"

const CategoryList = ({ clientCode, drawerOpen, setIsHappened, onCategoryChange }) => {
    const menuApiUtil = new ApiUtil()
    const [editingCategoryId, setEditingCategoryId] = useState(null)
    const [categoryCode, setCategoryCode] = useState("")
    const [currentPage, setCurrentPage] = useState(1)
    const [currentTotal, setCurrentTotal] = useState(10)
    const [deleteCategoryName, setDeleteCategoryName] = useState(null) 
    const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false)
    const [editedCategoryName, setEditedCategoryName] = useState("")
    const [isErrorMessage, setIsErrorMessage] = useState(false)
    const [isSuccessMessage, setIsSuccessMessage] = useState(false)
    const [messageContent, setMessageContent] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const userInfo = getUserInfo()
    const [addCategoryName, setAddCategoryName] = useState("")
    const isFirstLoad = useRef(true); // Use useRef to track the first load

    const getAllMenuCategory = (page = currentPage) =>
        menuApiUtil.get(
            `${EndPoints.menuCategory}?clientCode=${clientCode}&page=${page}&itemsPerPage=10`
        )

    const {
        data: onLoadDataCategory,
        refetch,
    } = useQuery({
        queryKey: ["getAllMenuCategory", currentPage],
        queryFn: () => {
            return getAllMenuCategory(currentPage);
        },
        enabled: false
    });

    useEffect(() => {    
        if (drawerOpen && isFirstLoad.current) {
            refetch(); // Trigger refetch explicitly
            isFirstLoad.current = false; // Update the ref value without causing re-renders
        }
        if (!drawerOpen) {
            setEditingCategoryId(null); // Reset editing state when drawer is closed
        }
    }, [drawerOpen]); // Only depend on drawerOpen

    useEffect(() => {
        if (onLoadDataCategory?.data?.data) {
            setIsErrorMessage(false);
            setIsSuccessMessage(false);
            setMessageContent("");
            const itemsReceived = onLoadDataCategory?.data?.data.length;
            if (itemsReceived < 10) {
                setCurrentTotal(currentTotal); // This logic seems redundant, consider reviewing it
            }
        }
    }, [onLoadDataCategory]); // Removed `drawerOpen` from dependencies

    const handleEdit = (category) => {
        setEditingCategoryId(category.categoryCode)
        setCategoryCode(category?.categoryCode)
        setEditedCategoryName(category?.name)
    }

    const handleDelete = (category) => {
        setDeleteCategoryName(category.name)  
        setIsDeleteModalVisible(true)
        setEditingCategoryId(null)
    }

    const triggerDeleteCategory = useMutation({
        mutationFn: (categoryCode) =>
            menuApiUtil.delete(
                `${EndPoints.menuCategory}?categoryCode=${categoryCode}`
            ),
        onSuccess: () => {
            setIsSuccessMessage(true)
            setMessageContent("Category deleted successfully")
            refetch()
            setIsHappened(true)
        },
        onError: (error) => {
            if(error?.response?.data?.errors[0].code === ERROR_CODE.ER_ROW_IS_REFERENCED_2){
                setIsErrorMessage(true)
                setIsSuccessMessage(false)
                setMessageContent("You can't delete the category before deleting Menu in this category")
            } else{
                setIsErrorMessage(true)
                setIsSuccessMessage(false)
                setMessageContent(error?.response?.data?.errors[0].msg || "Invalid")
            }
        },
    })

    const triggerUpdateCategory = useMutation({
        mutationFn: (updatedCategory) =>{
            return menuApiUtil.patch(
                `${EndPoints.menuCategory}?categoryCode=${categoryCode}`,
                updatedCategory
            );
        },
        onSuccess: () => {
            setIsErrorMessage(false)
            setIsSuccessMessage(true)
            setMessageContent("Category updated successfully!")
            setEditingCategoryId(null)
            refetch()
            setIsHappened(true)
        },
        onError: (error) => {
            setIsErrorMessage(true)
            setIsSuccessMessage(false)
            setMessageContent(error?.response?.data?.errors[0].msg || "Invalid")
        },
    })

    const handleUpdate = (categoryId) => {
        if (editedCategoryName !== onLoadDataCategory?.data?.data.find(cat => cat.categoryCode === categoryId)?.name) {
            const updatedCategory = {
                name: editedCategoryName,
                categoryCode: categoryId
            };
            triggerUpdateCategory.mutate(updatedCategory);
            setEditingCategoryId(null);
        } else {
            setIsErrorMessage(true);
            setMessageContent("No changes were made to the category.");
            setEditingCategoryId(null);
        }
    }

    const handleDeleteConfirm = () => {
        const categoryToDelete = onLoadDataCategory?.data?.data.find(
            (cat) => cat.name === deleteCategoryName
        )
        triggerDeleteCategory.mutate(categoryToDelete?.categoryCode)
        setIsDeleteModalVisible(false)  
    }

    const handleDeleteCancel = () => {
        setIsDeleteModalVisible(false)
    }

    const itemRender = (_, type, originalElement) => {
        if (type === "prev") {
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            return <a style={{ color: designPatterns.buttonPrimary }}>Previous</a>
        }
        if (type === "next") {
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            return <a style={{ color: designPatterns.buttonPrimary }}>Next</a>
        }
        return originalElement
    }

    const handlePaginationChange = (page) => {
        console.log(page, currentPage,"testing")

        if (page !== currentPage) {
            setCurrentPage(page);
        }
    };
    const isNextDisabled = onLoadDataCategory?.data?.data?.length < 10;
    const noCategory = !onLoadDataCategory?.data?.data || onLoadDataCategory?.data?.data?.length === 0

    const triggerAddCategory = useMutation({
        mutationFn: (data) => {
            return menuApiUtil.post(EndPoints.menuCategory, data)
        },
        onSuccess: (response) => {
            setTimeout(() => {
                setIsLoading(false)
                setIsSuccessMessage(true)
                setAddCategoryName("")
                setMessageContent(response?.data?.data?.message)
                refetch();
                onCategoryChange();
            }, 2000);
            setIsHappened(true)
        },
        onError: (error) => {
            setIsErrorMessage(true)
            setIsLoading(false)
            setAddCategoryName("")
            setMessageContent(error?.response.data.errors[0].msg || "An error occurred.")
        },
    })
    const handleAddCategory = (item) =>{
        if(item){
            const data = {
                clientCode: userInfo?.clientInfo?.clientCode,
                name: item,
            }
            triggerAddCategory.mutate(data)
            setIsLoading(true)
        }
    }
    return (
        <Flex justify="center" gap={"1rem"} vertical>
            {!noCategory ? (
                onLoadDataCategory?.data?.data &&
                onLoadDataCategory?.data?.data.map((list) => (
                    <Card
                        hoverable
                        key={list.menuId}
                        className={styles.categoryLabel}
                    >
                        <Flex
                            justify="space-between"
                            align="center"
                            wrap="no-wrap"
                        >
                            <div className={styles.name}>
                                {editingCategoryId === list.categoryCode ? (
                                    <Input
                                        value={editedCategoryName}
                                        onChange={(e) =>
                                            setEditedCategoryName(
                                                e.target.value
                                            )
                                        }
                                    />
                                ) : (
                                    list.name
                                )}
                            </div>

                            <div className={styles.icons}>
                                {editingCategoryId === list.categoryCode ? (
                                    <CheckOutlined
                                        onClick={() =>
                                            handleUpdate(list.categoryCode)
                                        }
                                        className={styles.iconsStyle}
                                    />
                                ) : (
                                    <EditOutlined
                                        onClick={() => handleEdit(list)}
                                        className={styles.iconsStyle}
                                    />
                                )}
                                {editingCategoryId === list.categoryCode ? (
                                    <CloseOutlined
                                        onClick={() =>
                                            setEditingCategoryId(null)
                                        }
                                        className={styles.iconsStyle}
                                    />
                                ) : (
                                    <DeleteOutlined
                                        onClick={() => handleDelete(list)}
                                        className={styles.iconsStyle}
                                    />
                                )}
                            </div>
                        </Flex>
                    </Card>
                ))
            ) : (
                <div className={styles.name}>
                    No Category, You can add category in Add Menu
                </div>
            )}
            {isLoading ? (
                <ConfigProvider
                    theme={{
                        cssVar: true,
                        components: {
                            Spin: {
                                colorPrimary: designPatterns.buttonPrimary,
                            },
                        },
                    }}
                >
                    <div className={styles.spinContainer}>
                        <Spin size="large" />
                    </div>{" "}
                </ConfigProvider>
            ) : null}
            <Card hoverable className={styles.categoryLabel}>
                <Flex justify="space-between" align="center" wrap="no-wrap">
                    <div className={styles.name}>
                        <Input
                            onChange={(e) =>
                                setAddCategoryName(e.target.value)
                            }
                            placeholder="Add New Category"
                            value={addCategoryName}
                        />
                    </div>

                    <div className={styles.icons}>
                        <CheckOutlined
                            onClick={() => handleAddCategory(addCategoryName)}
                            className={styles.iconsStyle}
                        />
                        <CloseOutlined
                            onClick={() => {
                                setAddCategoryName("");
                            }}                            
                            className={styles.iconsStyle}
                        />
                    </div>
                </Flex>
            </Card>

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
            <Modal
                title="Confirm Deletion"
                open={isDeleteModalVisible}
                onCancel={handleDeleteCancel}
                footer={[
                    <Button
                        key="cancel"
                        label="Cancel"
                        onClick={handleDeleteCancel}
                    />,
                    <Button
                        key="confirm"
                        type="primary"
                        label="Delete"
                        onClick={handleDeleteConfirm}
                    />,
                ]}
            >
                <p>
                    Are you sure you want to delete the category{" "}
                    <strong>{deleteCategoryName}</strong>?
                </p>
            </Modal>
            <ConfigProvider
                theme={{
                    cssVar: true,
                    components: {
                        Pagination: {
                            colorPrimaryBorder: designPatterns.buttonPrimary,
                            colorPrimaryHover: designPatterns.buttonPrimary,
                            colorText: designPatterns.iconColor,
                            colorPrimary: designPatterns.buttonPrimary,
                        },
                    },
                }}
            >
                <Pagination
                    current={currentPage}
                    total={currentTotal}
                    onChange={handlePaginationChange}
                    itemRender={itemRender}
                    align="end"
                    className={styles.pagination}
                    disabled={isNextDisabled}
                />
            </ConfigProvider>
        </Flex>
    )
}

export default CategoryList
