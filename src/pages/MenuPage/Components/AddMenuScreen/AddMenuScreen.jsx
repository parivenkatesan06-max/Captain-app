import { Drawer, Flex } from "antd"
import React, { useEffect, useState } from "react"
import MenuItem from "../../../../components/MenuItem/MenuItem"
import styles from "./AddMenuScreen.module.scss"
import AddMenuDrawer from "../AddMenuDrawer/AddMenuDrawer"
import Button from "../../../../components/Button/Button"
import EditMenuDrawer from "../EditMenuDrawer/EditMenuDrawer"
import AddMenuEmptyPlaceHolder from "../AddMenuEmptyPlaceHolder/AddMenuEmptyPlaceHolder"
import { PlusCircleFilled } from "@ant-design/icons"
import Toast from "../../../../components/Toast/Toast"
import EndPoints from "../../../../utility/EndPoints"
import ApiUtil from "../../../../utility/ApiUtil"
import { useMutation } from "@tanstack/react-query"
import imageCompression from "browser-image-compression"
import { useNavigate } from "react-router-dom"
import { getUserInfo } from "../../../../utility/userInfo"

const AddMenuScreen = ({ menuCategoryList }) => {
    // Use Form hook to create a form instance
    const [isDrawerVisible, setIsDrawerVisible] = useState(false)
    const [addMenuList, setAddMenuList] = useState([])
    const [addList, setAddList] = useState([])
    const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false)
    const [selectedMenu, setSelectedMenu] = useState(null)
    const [nextId, setNextId] = useState(1)
    const [newCategoryList, setNewCategoryList] = useState(menuCategoryList)
    const [toastMessage, setToastMessage] = useState("")
    const [showToast, setShowToast] = useState(false)
    const menuApiUtil = new ApiUtil()
    const navigate = useNavigate()
    const userInfo = getUserInfo()

    useEffect(() => {
        if (addMenuList.length > 0) {
            // Combine the two lists and remove duplicates using a Set
            const combinedList = [
                ...addMenuList.map((item) => item.menuCategory),
                ...menuCategoryList,
            ]

            // Create a Set from the combined list to remove duplicates and convert it back to an array
            const uniqueCategories = [...new Set(combinedList)]

            // Update the newCategoryList state with the unique categories
            setNewCategoryList(uniqueCategories)
        }
    }, [addMenuList, menuCategoryList])

    // Toggle drawer visibility and reset form
    const toggleDrawer = () => {
        setIsDrawerVisible(!isDrawerVisible)
    }
    const toggleEditDrawer = () => {
        setIsEditDrawerVisible(!isEditDrawerVisible)
    }

    // Handle saving the new menu to the list
    const handleSaveMenu = (newMenu, storeData) => {
        setAddMenuList((prevList) => [...prevList, { ...newMenu, id: nextId }])
        setAddList((prevList) => [...prevList, { ...storeData, id: nextId }])
        setNextId(nextId + 1)
    }

    const handleEdit = (menuItem) => {
        setSelectedMenu(menuItem)
        setIsEditDrawerVisible(true)
    }
    const handleDelete = (menuId) => {
        setAddMenuList((prevList) =>
            prevList.filter((menu) => menu.id !== menuId)
        )
        setAddList((prevList) => prevList.filter((menu) => menu.id !== menuId))
    }

    // Function to compress and resize the image
    const compressImage = async (imageBase64) => {
        try {
            // Convert the Base64 string to a file object
            const response = await fetch(imageBase64)
            const blob = await response.blob()
            const file = new File([blob], "image", { type: blob.type })

            // Set compression options
            const options = {
                maxSizeMB: 1, // Set max size to 1MB
                maxWidthOrHeight: 800, // Set max width/height
                useWebWorker: true,
            }

            // Compress the image
            const compressedFile = await imageCompression(file, options)

            // Convert the compressed file back to Base64
            const compressedBase64 = await convertFileToBase64(compressedFile)
            return compressedBase64
        } catch (error) {
            console.error("Image compression failed", error)
            return imageBase64
        }
    }

    // Helper function to convert a file to Base64
    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()
            reader.onloadend = () => resolve(reader.result)
            reader.onerror = (error) => reject(error)
            reader.readAsDataURL(file)
        })
    }

    // Handle saving the menu list
    const handleSave = async () => {
        try {
            // Process the addMenuList and compress images before sending the payload
            const payload = await Promise.all(
                addList.map(async (item) => {
                    // Compress the image if it exists
                    const compressedImage = item.image
                        ? await compressImage(item.image)
                        : item.image
                    console.log(compressedImage, "compressedImage")
                    return {
                        clientCode: userInfo?.clientInfo?.clientCode,
                        menuName: item.menuName,
                        categoryCode: item.menuCategory,
                        price: parseFloat(item.price),
                        // menuImageUrl: compressedImage, // Use the compressed image here
                        meuImageUrl:
                            "https://www.istockphoto.com/photo/isolated-chilled-coca-cola-gm458120031-17462247?searchscope=image%2Cfilm",
                        offerPct: item.offerPercent || "0",
                        menuDescription: item?.menuDescription,
                        // quantity: item.quantity.toString(),
                    }
                })
            )
            const finalPayload = {
                payload,
            }
            // Trigger the mutation with the processed payload
            triggerAddmenu.mutate(finalPayload)
        } catch (error) {
            setToastMessage("Error saving data:", error?.message)
        }
    }

    const triggerAddmenu = useMutation({
        mutationFn: (data) => menuApiUtil.post(EndPoints.getAllMenu, data),
        onSuccess: () => {
            setShowToast(true)
            setToastMessage("Menu added successfully")
            navigate("/")
        },
        onError: (error) => {
            setShowToast(true)
            setToastMessage(error)
        },
    })

    const handleSaveEdited = (newMenu) => {
        setAddMenuList((prevList) => {
            const updatedList = prevList.map((menu) =>
                menu.id === newMenu.id ? { ...menu, ...newMenu } : menu
            )
            return updatedList
        })
        setAddList((prevList) => {
            const updatedList = prevList.map((menu) =>
                menu.id === newMenu.id ? { ...menu, ...newMenu } : menu
            )
            return updatedList
        })
        setIsEditDrawerVisible(false)
    }

    const handleCancel = () => {
        setAddMenuList([])
        setAddList([])
    }

    // Render either the default menu item or the list of menu items
    const renderMenuItems = () => {
        return (
            <Flex gap="middle" wrap className={styles.menuContainer}>
                {addMenuList.map((menu) => (
                    <div className={styles.menuList} key={menu.id}>
                        <MenuItem
                            menuname={menu.menuName}
                            menucategory={menu.menuCategory}
                            price={menu.price}
                            currency={"INR"}
                            image={menu.image}
                            quantity={menu.quantity}
                        />
                        <div className={styles.modal}>
                            <div className={styles.editDownload}>
                                <Button
                                    type="primary"
                                    label={"Edit"}
                                    onClick={() => handleEdit(menu)}
                                    style={{
                                        minWidth: "110px",
                                        marginTop: "6px",
                                    }}
                                />
                                <Button
                                    type="primary"
                                    label={"Delete"}
                                    style={{
                                        minWidth: "110px",
                                        marginBottom: "6px",
                                    }}
                                    onClick={() => handleDelete(menu.id)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
                <div className={styles.menuList}>
                    <AddMenuEmptyPlaceHolder
                        icon={<PlusCircleFilled />}
                        text={"Add Menu"}
                        onClick={toggleDrawer}
                    />
                </div>
            </Flex>
        )
    }

    return (
        <>
            <Flex vertical className={styles.addMenuContainer}>
                <Flex gap="middle" wrap className={styles.menuContainer}>
                    {renderMenuItems()}
                    <Drawer
                        title="Add New Menu"
                        open={isDrawerVisible}
                        onClose={toggleDrawer}
                        width={400}
                    >
                        <AddMenuDrawer
                            Category={menuCategoryList}
                            onSave={handleSaveMenu}
                            isDrawerVisible={isDrawerVisible}
                        />
                    </Drawer>
                    <Drawer
                        title="Edit Menu"
                        open={isEditDrawerVisible}
                        onClose={toggleEditDrawer}
                        width={400}
                    >
                        <EditMenuDrawer
                            Category={newCategoryList}
                            menuData={selectedMenu}
                            onSave={handleSaveEdited}
                            isEditDrawerVisible={isEditDrawerVisible}
                        />
                    </Drawer>
                </Flex>
                <Flex gap={10} className={styles.buttonContainer}>
                    {addMenuList.length > 0 && (
                        <>
                            <Button
                                type="primary"
                                label={"Save"}
                                style={{ minWidth: "110px" }}
                                onClick={handleSave}
                            />
                            <Button
                                type="secondary"
                                label={"Cancel"}
                                style={{
                                    minWidth: "110px",
                                }}
                                onClick={handleCancel}
                            />
                        </>
                    )}
                </Flex>
            </Flex>
            <Toast
                message={toastMessage}
                visible={showToast}
                duration={3000}
                onClose={() => setShowToast(false)} // Hide toast on close
            />
        </>
    )
}

export default AddMenuScreen
