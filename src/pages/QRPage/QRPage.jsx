import React, { useEffect, useMemo, useState } from "react";
import {
    Layout,
    Flex,
    Typography,
    Form,
    Row,
    Col,
    Pagination,
    ConfigProvider,
} from "antd";
import PageHeader from "../../components/Header/Header";
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs";
import EmptyPlaceHolder from "../../components/EmptyPlaceHolder/EmptyPlaceHolder";
import Button from "../../components/Button/Button";
import { PlusCircleFilled } from "@ant-design/icons";
import styles from "./QRPage.module.scss";
import config from "./QRPage.config.json";
import ApiUtil from "../../utility/ApiUtil";
import { useMutation, useQuery } from "@tanstack/react-query";
import endPoints from "../../utility/EndPoints";
import qrCode from "../../assets/Image/icons/QR-View.svg";
import QRList from "./QRList";
import { getUserInfo } from "../../utility/userInfo";
import { getLabels } from "../../utility/labelUtils";
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie";
import qrLabels from "./QRPage.labels.json";
import { Link, useNavigate, useLocation } from "react-router-dom";
import AddQRCode from "./AddQRCode";
import Toast from "../../components/Toast/Toast";
import ModalContent from "../../components/ModalContent/ModalContent";
import designPatterns from "../../styles/base/_variables.module.scss";
import usePermissions from "../../utility/ApiUtil/usePermissions";
import ScreenWidget from "../../components/ScreenWidget/ScreenWidget";
import EndPoints from "../../utility/EndPoints";
import ErrorPage from "../ErrorPage/ErrorPage";

function QRPage() {
    const userInfo = getUserInfo();
    const navigate = useNavigate();
    const location = useLocation();
    const [showAddMenu, setShowAddMenu] = useState(false);
    const [qrList, setQrList] = useState([]);
    const [showToast, setShowToast] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [open, setOpen] = useState(false);
    const [selectedQRCode, setSelectedQRCode] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [loading, setLoading] = useState(false);
    const [isError, setIsError] = useState(false);
    const [screenList, setScreenList] = useState([]);
    const { Header, Content } = Layout;
    const { Title } = Typography;
    const [tablePagebreadcrumbs, setTablePagebreadcrumbs] = useState([
        {
            title: qrLabels?.qrCodeTitle,
        },
    ]);
    const userPermission = usePermissions();
    const labels = getLabels(userInfo);
    const qrApiUtil = new ApiUtil();
    const [form] = Form.useForm();
    const [isShowScreen, setIsShowScreen] = useState(true);
    const [entityCode, setEntityCode] = useState("");
    const selectedEntityConfig = useMemo(() => {
        const defaultConfig = config["Theatre"];
        defaultConfig.inputs.clientCode = {
            ...defaultConfig?.inputs?.clientCode,
            defaultValue: userInfo?.clientInfo?.clientCode,
        };
        return defaultConfig;
    }, [userInfo.entity]);
    const [clientInfo, setClientInfo] = useState({
        name: "",
        address: "",
        phone_no: "",
        email: "",
        gstin: "",  
        logo_url: ""
    })

    useEffect(() => {
        const savedPage = localStorage.getItem("currentPage");
        if (savedPage) {
            setCurrentPage(Number(savedPage));
        }

        if (location.pathname === "/qr" && isShowScreen) {
            setShowAddMenu(false);
            setTablePagebreadcrumbs([
                {
                    title: qrLabels?.qrScreens,
                    link: "/qr",
                },
            ]);
        } else if (location.pathname === "/qr" && !isShowScreen) {
            setShowAddMenu(false);
            setTablePagebreadcrumbs([
                {
                    title: qrLabels?.qrScreens,
                    link: "/qr",
                    onClick: () => setIsShowScreen(true),
                },
                {
                    title: qrLabels?.qrCodeTitle,
                    link: "/qr",
                },
            ]);
        } else if (location.pathname === "/qr/addQR") {
            setShowAddMenu(true);
            setTablePagebreadcrumbs([
                {
                    title: qrLabels?.qrScreens,
                    link: "/qr",
                    onClick: () => setIsShowScreen(true),
                },
                {
                    title: qrLabels?.qrCodeTitle,
                    link: "/qr",
                    onClick: handleBreadcrumbClick,
                },
                { title: qrLabels?.addQRCodeLabel },
            ]);
        }
    }, [location.pathname, isShowScreen]);

    const getQRCode = async (entityCodeParam, page = currentPage) => {
        if (!entityCodeParam) return;
        setLoading(true);
        try {
            const response = await qrApiUtil.get(
                `${endPoints.qrCode}?entityCode=${entityCodeParam}&page=${page}&itemsPerPage=10`
            );
            const qrs = response?.data?.data || [];
            setQrList(qrs);
            if (qrs.length === 10) {
                setTotalPages(page + 1);
            } else {
                setTotalPages(page);
            }
        } catch (error) {
            console.error("Error fetching QR codes:", error);
            setIsError(true);
        } finally {
            setLoading(false);
        }
    };

    const handleBreadcrumbClick = () => {
        setShowAddMenu(false);
        setIsShowScreen(false);
        setTablePagebreadcrumbs([
            {
                title: qrLabels?.qrScreens,
                link: "/qr",
                onClick: () => setIsShowScreen(true),
            },
            {
                title: qrLabels?.qrCodeTitle,
                link: "/qr",
            }
        ]);
        navigate("/qr");
    };

    const handleAddMenu = () => {
        setShowAddMenu(true);
        setTablePagebreadcrumbs([
            {
                title: qrLabels?.qrScreens,
                link: "/qr",
                onClick: () => setIsShowScreen(true),
            },
            {
                title: qrLabels?.qrCodeTitle,
                link: "/qr",
                onClick: handleBreadcrumbClick,
            },
            { title: qrLabels?.addQRCodeLabel },
        ]);
        navigate("/qr/addQR");
        form.resetFields();
        setIsShowScreen(false);
    };

    const content = () => {
        return <span>You want to delete {selectedQRCode?.seatCode} QR Code?</span>;
    };

    function deleteQRCode(seatCode) {
        return qrApiUtil.delete(`${endPoints.qrCode}?seatCode=${seatCode}`);
    }

    const deleteMutation = useMutation({
        mutationFn: deleteQRCode,
        onSuccess: (data) => {
            getQRCode(entityCode, currentPage);
            setQrList((prevList) => prevList.filter((qr) => qr.id !== data.id));
        },
        onError: () => {
            setShowToast(true);
            setToastMessage("Something went wrong");
        },
    });

    const handleOnDelete = (qrData) => {
        setOpen(false);
        deleteMutation.mutate(qrData?.seatCode);
    };

    const handleOnCancel = () => {
        setOpen(false);
    };

    const handleDeleteClick = (qrData) => {
        setSelectedQRCode(qrData);
        setOpen(true);
    };

    const handleScreenClick = async (screen) => {
        if (!screen?.entityCode) return;
        
        const newEntityCode = screen.entityCode;
        setEntityCode(newEntityCode);
        setLoading(true);
        
        try {
            await getQRCode(newEntityCode, currentPage);
            setIsShowScreen(false);
        } catch (error) {
            setShowToast(true);
            setToastMessage("Failed to load QR codes");
        }
    };

    const renderQRImageComponent = () => {
        return (
            <div className={styles.mainContainerComponent}>
                <div className={styles.qrContainerComponent}>
                    <div className={styles.infoComponent}>
                        <Title level={3}>{labels?.qrCodeTitle}</Title>
                    </div>
                    <img
                        src={qrCode}
                        alt="signupimage"
                        className={styles.qrImageComponent}
                        id="qr-code"
                    />
                    <div className={styles.tableInfoComponent}>
                        <Title level={5}>{labels?.table}</Title>
                    </div>
                </div>
            </div>
        );
    };

    const isAddQRCodePath = () => location.pathname === "/qr/addQR";

    const renderEmptyPlaceholder = () => {
        if (qrList && qrList.length === 0 && !loading) {
            return (
                <Flex
                    gap="middle"
                    wrap={true}
                    justify="center"
                    align="center"
                    className={styles.renderContent}
                >
                    <EmptyPlaceHolder
                        icon={<PlusCircleFilled />}
                        text={qrLabels?.addIconLabel}
                        onClick={handleAddMenu}
                    />
                </Flex>
            );
        }
        return null;
    };

    const fetchScreenDetails = () =>
        qrApiUtil.get(`${EndPoints.clientEntity}?clientCode=${userInfo?.clientInfo?.clientCode}`);

    const { data: onLoadScreenData, isLoading: isLoadingScreen, isError: isErrorScreen } = useQuery({
        queryKey: ["fetchScreenDetails"],
        queryFn: fetchScreenDetails,
    });

    useEffect(() => {
        if (onLoadScreenData?.data?.data) {
            setScreenList(onLoadScreenData?.data?.data);
            triggerClient.mutate(userInfo?.clientInfo?.clientGroupCode)
        }
    }, [onLoadScreenData?.data?.data]);
    function getClientLogo(clientCode) {
        return qrApiUtil.get(
            `${EndPoints.client}/${clientCode}`
        );
    }

    const triggerClient = useMutation({
        mutationFn: (clientCode) => getClientLogo(clientCode),
        onSuccess: (data) => {
            const clientInfo = data?.data?.data
            const specificClient = Array.isArray(clientInfo) 
                ? clientInfo.find(client => client.clientCode === userInfo?.clientInfo.clientCode)
                : clientInfo;
        
            if (specificClient?.logo_url) {
                setClientInfo({
                    name: specificClient?.name,
                    address: specificClient?.address,
                    phone_no: specificClient?.phone_no,
                    email: specificClient?.email,
                    gstin: specificClient?.gstin,
                    logo_url: specificClient?.logo_url
                })        
            }
        },
        onError: (error) =>{
            console.log(error,"error")
        }
    })
    useEffect(() => {
        if (entityCode && !showAddMenu && !isShowScreen && !loading) {
            getQRCode(entityCode, currentPage);
        }
    }, [entityCode, currentPage, showAddMenu]);

    if (isLoadingScreen) {
        return <LoaderLottie />;
    }

    if (isError || isErrorScreen) {
        return <ErrorPage/>;  
    }

    const renderQRList = () => {
        if (loading) {
            return <LoaderLottie />;
        }
        if (qrList && qrList.length > 0) {
            return (
                <Flex className={styles.qrForm} vertical>
                    <QRList
                        qrList={qrList}
                        onDeleteClick={handleDeleteClick}
                        labels={labels}
                        userInfo={userInfo}
                        clientInfo={clientInfo}
                    />
                    <ModalContent
                        closeIcon={null}
                        open={open}
                        content={content()}
                        primaryButtonLabel={"Delete"}
                        primaryOnClick={() => handleOnDelete(selectedQRCode)}
                        secondaryButtonLabel={"Cancel"}
                        secondaryOnClick={handleOnCancel}
                    />
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
                            total={totalPages * 10}
                            pageSize={10}
                            onChange={(page) => {
                                setCurrentPage(page);
                                localStorage.setItem("currentPage", page);
                            }}
                            showSizeChanger={false}
                            showQuickJumper={false}
                            align="end"
                            style={{
                                textAlign: "right",
                                marginTop: "20px",
                            }}
                        />
                    </ConfigProvider>
                </Flex>
            );
        }
        return renderEmptyPlaceholder();
    };

    const renderAddQRCode = () => (
        <AddQRCode
            selectedEntityConfig={selectedEntityConfig}
            form={form}
            qrList={qrList}
            setQrList={setQrList}
            setShowToast={setShowToast}
            setToastMessage={setToastMessage}
        />
    );

    const renderScreenWidgets = () => (
        <Flex gap={8} className={styles.screenContainer}>
            <Flex justify="center" gap="0.5rem" wrap>
                {screenList?.length > 0 ? (
                    screenList.map((screen, index) => (
                        <ScreenWidget
                            onClick={() => handleScreenClick(screen)}
                            screenNumber={screen?.entityName}
                            key={screen?.entityId || index}
                        />
                    ))
                ) : (
                    <div>No screens available</div>
                )}
            </Flex>
        </Flex>
    );
    
    const renderAddQRSection = () => (
        <Row className={styles.qrForm}>
            <Col span={12}>{isAddQRCodePath() && renderAddQRCode()}</Col>
            <Col span={12} style={{ justifyItems: "center" }}>
                {isAddQRCodePath() && renderQRImageComponent()}
            </Col>
        </Row>
    );
    
    const renderContent = () => {
        if (loading) {
            return <LoaderLottie />;
        }
        if (!showAddMenu) {
            if (isShowScreen) {
                return renderScreenWidgets();
            }
            return renderQRList();
        }
        return renderAddQRSection();
    };

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    {!showAddMenu && userPermission.includes("read_write_qrcode") && (
                        <Button
                            type="primary"
                            label="Add QR"
                            onClick={handleAddMenu}
                            icon={<PlusCircleFilled />}
                            iconPosition="end"
                        />
                    )}
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs
                        items={tablePagebreadcrumbs.map((breadcrumb) => ({
                            title: breadcrumb.onClick ? (
                                <Link to={breadcrumb.link} onClick={breadcrumb.onClick}>
                                    {breadcrumb.title}
                                </Link>
                            ) : (
                                breadcrumb.title
                            ),
                        }))}
                        separator=">"
                    />
                    <Title level={2}>{labels?.qrTitle}</Title>
                </Flex>
                {renderContent()}
                <Toast
                    message={toastMessage}
                    visible={showToast}
                    duration={3000}
                    onClose={() => setShowToast(false)}
                />
            </Content>
        </Layout>
    );
}

export default QRPage;