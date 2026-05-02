/* eslint-disable complexity */
import React, { useEffect, useState } from "react"
import { Layout, Flex, Typography } from "antd"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import labels from "./InventoryPage.label.json"
import Button from "../../components/Button/Button"
import EmptyPlaceHolder from "../../components/EmptyPlaceHolder/EmptyPlaceHolder"
import { ReactComponent as EmptyIcon } from "../../assets/Image/icons/emptyIcon.svg"
import Toast from "../../components/Toast/Toast"
import { ArrowDownOutlined, ArrowUpOutlined } from "@ant-design/icons"
import InventoryTable from "../../components/InventoryTableView/InventoryTable"
import Styles from "./InventoryPage.module.scss"
import designPatterns from "../../styles/base/_variables.module.scss"
import templateData from "../../assets/InventoryTemplate/inventoryTemplate.json"
import {
    convertExcelToJson,
    convertJsonToExcel,
} from "../../utility/FileConvert"
import { useMutation, useQuery } from "@tanstack/react-query"
import ApiUtil from "../../utility/ApiUtil/ApiUtil"
import endPoints from "../../utility/EndPoints"
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie"
import { ENTITY } from "../../utility/constants"
import { getUserInfo } from "../../utility/userInfo"
import stylesVariable from "../../styles/base/_stylesVariable.module.scss"
import ErrorPage from "../ErrorPage/ErrorPage"

function InventoryPage() {
    const fileInputRef = React.createRef()
    const { Header, Content } = Layout
    const { Title } = Typography
    const [data, setData] = useState([])
    const [showToast, setShowToast] = useState(false)
    const [toastMessage, setToastMessage] = useState("")
    const [isDownloadComplete, setIsDownloadComplete] = useState(false)
    const [hasUploadedTemplate, setHasUploadedTemplate] = useState(false)
    const tablePagebreadcrumbs = [
        {
            title: labels?.pageTitle,
        },
    ]

    const userInfo = getUserInfo()

    useEffect(() => {
        const uploadStatus =
            localStorage.getItem("hasUploadedTemplate") === "true"
        setHasUploadedTemplate(uploadStatus)
        setIsDownloadComplete(uploadStatus)
        if (uploadStatus) {
            setData([]);
        }
    }, [])

    const addInventoryApiUtil = new ApiUtil()

    async function uploadInventoryData(payload) {
        return addInventoryApiUtil.post(
            `${endPoints.addInventoryList}?entity=${userInfo.entity}`,
            payload
        )
    }

    const triggerUpload = useMutation({
        mutationFn: uploadInventoryData,
        onSuccess: (responseData) => {
            setShowToast(true)
            setToastMessage(labels?.uploadSuccess)

            setTimeout(() => {
                setShowToast(false)
                setToastMessage("")
                setData(responseData?.data?.data)
                setHasUploadedTemplate(true)
                localStorage.setItem("hasUploadedTemplate", "true")
            }, 3000)
        },
        onError: (error) => {
            setShowToast(true)
            setToastMessage(error)
            console.error(error)
        },
    })

    const getInventoryList = new ApiUtil()

    function getInventory() {
        return getInventoryList.get(
            `${endPoints.getInventoryList}?entity=${userInfo.entity}`
        )
    }

    let {
        data: onLoadData,
        isLoading,
        isError,
    } = useQuery({
        queryKey: ["getInventory"],
        queryFn: getInventory,
        enabled: hasUploadedTemplate,
    })

    useEffect(() => {
        if (onLoadData?.data?.data) {
            setData(onLoadData?.data?.data)
        }
    }, [onLoadData])

    if (isLoading) {
        return <LoaderLottie />
    }

    if (isError) {
        return <ErrorPage  />; 
    }

    const handleFileUpload = async (event) => {
        const file = event.target.files[0]
        if (file) {
            try {
                const jsonData = await convertExcelToJson(file)
                const inventoryData = [...jsonData].sort((a, b) =>
                    a["Item Category"].localeCompare(b["Item Category"])
                )
                const mappedData = inventoryData.map((item, index) => ({
                    id: String(index),
                    menuName: item["Item Name"],
                    menuCategory: item["Item Category"],
                    unitPrice: item["Unit Price"],
                    quantity: item.Quantity,
                }))

                triggerUpload.mutate(mappedData)
            } catch (error) {
                console.error(error)
            }
        }
    }

    const handleDownloadTemplate = () => {
        let template
        if (userInfo?.entity === ENTITY.HOTEL) {
            template = templateData.Hotel
        } else if (userInfo?.entity === ENTITY.THEATRE) {
            template = templateData.Theatre
        }
        try {
            convertJsonToExcel(template, "template.xlsx")

            setIsDownloadComplete(true)
            setShowToast(true)
            setToastMessage(labels.downloadSuccess)
        } catch (error) {
            console.error("Error while downloading template:", error)
        }
    }

    const triggerFileInput = () => {
        if (!hasUploadedTemplate) {
            fileInputRef.current.click()
        }
    }

    const getIconStyle = (isDeleted) => ({
        cursor: isDeleted ? "not-allowed" : "pointer",
        opacity: isDeleted ? 0.5 : 1,
    })
    const handleDragOver = (e) => {
        if (!isDownloadComplete) return;
        e.preventDefault() 
        e.dataTransfer.dropEffect = "copy" 
    }

    const handleDrop = async (e) => {
        if (!isDownloadComplete) return
        e.preventDefault()
        const file = e.dataTransfer.files[0]
        if (file) {
            try {
                const jsonData = await convertExcelToJson(file)
                const inventoryData = [...jsonData].sort((a, b) =>
                    a["Item Category"].localeCompare(b["Item Category"])
                )
                const mappedData = inventoryData.map((item, index) => ({
                    id: String(index),
                    menuName: item["Item Name"],
                    menuCategory: item["Item Category"],
                    unitPrice: item["Unit Price"],
                    quantity: item.Quantity,
                }))

                triggerUpload.mutate(mappedData)
            } catch (error) {
                console.error(error)
            }
        }
    }

    const renderEmptyplaceHolder = () => {
        if (hasUploadedTemplate) {
            return null
        }
        return (
            <EmptyPlaceHolder
                icon={<EmptyIcon />}
                text={
                    isDownloadComplete
                        ? labels?.uploadTemplete
                        : labels?.noItems
                }
                onDragOver={handleDragOver}
                onDrop={handleDrop}
            />
        )
    }

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    <Flex gap={12}>
                        <Button
                            label="Upload Template"
                            icon={
                                <ArrowUpOutlined
                                    className={Styles.uploadIcon}
                                    style={{ fontSize: stylesVariable.arrowUpOutlinedFontSize }}
                                />
                            }
                            style={{
                                color: designPatterns.buttonPrimary,
                                ...getIconStyle(
                                    hasUploadedTemplate || !isDownloadComplete
                                ),
                            }}
                            iconPosition="end"
                            onClick={triggerFileInput}
                        />
                        <input
                            type="file"
                            ref={fileInputRef}
                            accept=".xlsx, .xls"
                            style={{ display: "none" }}
                            onChange={handleFileUpload}
                        />
                        <Button
                            label="Download Template"
                            type="primary"
                            icon={
                                <ArrowDownOutlined
                                    className={Styles.downloadIcon}
                                />
                            }
                            iconPosition="end"
                            onClick={(e) => {
                                if (isDownloadComplete) {
                                    e.preventDefault()
                                } else {
                                    handleDownloadTemplate()
                                }
                            }}
                            style={getIconStyle(isDownloadComplete)}
                        />
                    </Flex>
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={tablePagebreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.inventoryTitle}</Title>
                </Flex>
                <Flex
                    gap="middle"
                    wrap={true}
                    align="center"
                    justify="center"
                    className={Styles.inventoryContainer}
                >
                    <Toast
                        message={toastMessage}
                        visible={showToast}
                        duration={3000}
                        onClose={() => setShowToast(false)}
                    />
                    {renderEmptyplaceHolder()}
                </Flex>
                {data.length >= 0 && (
                    <InventoryTable initialDataSource={data} />
                )}
            </Content>
        </Layout>
    )
}

export default InventoryPage
