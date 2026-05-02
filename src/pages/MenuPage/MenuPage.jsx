import React, { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { Layout, Flex, Typography, Drawer, Spin, Modal, Tabs, ConfigProvider, Pagination } from "antd";
import { useMutation, useQuery } from "@tanstack/react-query";
import { LeftCircleOutlined, PlusCircleFilled, RightCircleOutlined } from "@ant-design/icons";
import PageHeader from "../../components/Header/Header";
import Button from "../../components/Button/Button";
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs";
import ApiUtil from "../../utility/ApiUtil/ApiUtil";
import endPoints from "../../utility/EndPoints";
import MenuItem from "../../components/MenuItem/MenuItem";
import { getUserInfo } from "../../utility/userInfo";
import { getLabels } from "../../utility/labelUtils";
import LoaderLottie from "../../components/LoaderLottie/LoaderLottie";
import { useLocation, useNavigate } from "react-router-dom";
import styles from "./MenuPage.module.scss";
import usePermissions from "../../utility/ApiUtil/usePermissions";
import AddMenuDrawer from "./Components/AddMenuDrawer/AddMenuDrawer";
import Toast from "../../components/Toast/Toast";
import CategoryList from "./Components/CategoryList/CategoryList";
import EditMenuDrawer from "./Components/EditMenuDrawer/EditMenuDrawer";
import Lottie from "lottie-react";
import LoaderLottieJson from "../../assets/Lottie/loader-lottie.json";
import nodataLottie from "../../assets/Lottie/order-lottie.json";
import designPatterns from "../../styles/base/_variables.module.scss";
import stylesVariable from "../../styles/base/_stylesVariable.module.scss";
import EndPoints from "../../utility/EndPoints";
import ConsumerButton from "../../components/ConsumerViewComponents/ConsumerButton/ConsumerButton";
import ErrorPage from "../ErrorPage/ErrorPage";

// eslint-disable-next-line complexity
function MenuPage() {
    const { Header, Content } = Layout;
    const { Title } = Typography;
    const userInfo = getUserInfo();
    const navigate = useNavigate();
    const location = useLocation();
    const labels = getLabels(userInfo);
    const userPermission = usePermissions();
    const menuPagebreadcrumbs = [{ title: "Menu" }];
    const menuApiUtil = new ApiUtil();
    const [menuList, setMenuList] = useState([]);
    const [onloadCategoryList, setOnloadCategoryList] = useState([]);
    const [isDrawerVisible, setIsDrawerVisible] = useState(false);
    const [isEditDrawerVisible, setIsEditDrawerVisible] = useState(false);
    const [toastMessage, setToastMessage] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState("");
    const [isCategoryDrawerVisible, setIsCategoryDrawerVisible] = useState(false);
    const [selectedMenu, setSelectedMenu] = useState(null);
    const [showLoader, setShowLoader] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [menuToDelete, setMenuToDelete] = useState(null);
    const [isHappened, setIsHappened] = useState(false);
    const [page, setPage] = useState(1); // For category pagination
    const [currentMenuPage, setCurrentMenuPage] = useState(1); // For menu items pagination
    const [totalMenuPages, setTotalMenuPages] = useState(1);
    const itemsPerPage = 10;

    const initialLoadRef = useRef(false);

    // Fetch menu items
    const triggerGetMenu = useMutation({
        mutationFn: ({ categoryCode, page }) =>
            menuApiUtil.get(
                `${endPoints.getAllMenu}?clientCode=${userInfo?.clientInfo?.clientCode}&categoryCode=${categoryCode}&page=${page}&itemsPerPage=${itemsPerPage}`
            ),
        onSuccess: (response) => {
            setTimeout(() => {
                setShowLoader(false);
                const data = response?.data?.data || [];
                setMenuList(data);
                setTotalMenuPages(data.length === itemsPerPage ? currentMenuPage + 1 : currentMenuPage);
            }, 2000);
        },
        onError: (error) => {
            setShowToast(true);
            setToastMessage(error?.response?.data?.errors[0].msg || "Invalid");
            setShowLoader(false);
        },
    });

    // Fetch categories
    const getAllMenuCategory = () =>
        menuApiUtil.get(
            `${EndPoints.menuCategory}?clientCode=${userInfo?.clientInfo?.clientCode}&page=${page}&itemsPerPage=10`
        );

    const {
        data: onLoadDataCategory,
        isLoading: isLoadingCategory,
        isError: isErrorCategory,
        refetch,
    } = useQuery({
        queryKey: ["getAllMenuCategory", page],
        queryFn: getAllMenuCategory,
        staleTime: 0,
        cacheTime: 0,
        refetchOnMount: true,
        refetchOnWindowFocus: true,
    });

    // Initialize menu fetch only once on first category load
    useEffect(() => {
        if (onLoadDataCategory?.data?.data && !initialLoadRef.current) {
            const categoryList = onLoadDataCategory.data.data;
            setOnloadCategoryList(categoryList);

            if (!selectedCategory && categoryList[0]?.categoryCode) {
                setSelectedCategory(categoryList[0].categoryCode);
                triggerGetMenu.mutate({
                    categoryCode: categoryList[0].categoryCode,
                    page: currentMenuPage,
                });
                setShowLoader(true);
            }

            initialLoadRef.current = true; // Prevent further calls
        }
    }, [onLoadDataCategory, selectedCategory, triggerGetMenu]);

    // Refetch categories when isHappened changes
    useEffect(() => {
        if (isHappened) {
            refetch();
            setIsHappened(false);
        }
    }, [isHappened, refetch]);

    // Add new effect to handle category updates
    useEffect(() => {
        if (onLoadDataCategory?.data?.data) {
            setOnloadCategoryList(onLoadDataCategory.data.data);
        }
    }, [onLoadDataCategory]);

    const debounceRef = useRef(false);
    const handleCategoryClick = useCallback((category) => {
        
        if (debounceRef.current) return;
        debounceRef.current = true;
        
        if (category?.categoryCode && category.categoryCode !== selectedCategory) {
            setCurrentMenuPage(1);
            setSelectedCategory(category.categoryCode);
            
            triggerGetMenu.mutate({
                categoryCode: category.categoryCode,
                page: 1,
            });
            setShowLoader(true);
        }
        
        setTimeout(() => {
            debounceRef.current = false;
        }, 300); // 300ms cooldown
    }, [selectedCategory, triggerGetMenu]);

    const toggleDrawer = () => setIsDrawerVisible(!isDrawerVisible);
    const toggleCategoryDrawer = () => {
        setIsCategoryDrawerVisible(!isCategoryDrawerVisible);
        if (!isCategoryDrawerVisible && onLoadDataCategory?.data?.data?.[0]?.categoryCode && isHappened) {
            setSelectedCategory(onLoadDataCategory.data.data[0].categoryCode);
            triggerGetMenu.mutate({
                categoryCode: onLoadDataCategory.data.data[0].categoryCode,
                page: 1,
            });
            setShowLoader(true);
        }
    };
    const toggleEditDrawer = () => setIsEditDrawerVisible(!isEditDrawerVisible);

    const handleSaveMenu = (newMenu,categoryCode) => {
        const payload = {
            clientCode: userInfo?.clientInfo?.clientCode,
            menuName: newMenu.menuName,
            categoryCode: newMenu.id ? categoryCode : newMenu.menuCategory,
            price: parseFloat(newMenu.price),
            menuImageUrl: newMenu.image,
            offerPct: parseFloat(newMenu.offerPct).toFixed(2) || "0.00",
            menuDescription: newMenu?.menuDescription,
        };

        if (newMenu.id) {
            // Update case
            triggerUpdateMenu.mutate({data: payload, menuId: newMenu.id});
        } else {
            // Add case
            triggerAddMenu.mutate(payload);
        }
    };

    const triggerAddMenu = useMutation({
        mutationFn: (data) => menuApiUtil.post(endPoints.getAllMenu, data),
        onSuccess: () => {
            setShowToast(true);
            setToastMessage("Menu added successfully");
            navigate("/")
            triggerGetMenu.mutate({
                categoryCode: selectedCategory,
                page: currentMenuPage,
            });
            setIsDrawerVisible(false);
            refetch();
        },
        onError: (error) => {
            setShowToast(true);
            setToastMessage(error?.response?.data?.errors[0].message || "Invalid");
        },
    });
    const triggerUpdateMenu = useMutation({
        mutationFn: ({data,menuId}) => menuApiUtil.put(`${endPoints.getAllMenu}/${menuId}`, data),
        onSuccess: () => {
            setShowToast(true);
            setToastMessage("Menu Updated successfully");
            triggerGetMenu.mutate({
                categoryCode: selectedCategory,
                page: currentMenuPage,
            });
            setIsEditDrawerVisible(false);
            refetch();
        },
        onError: (error) => {
            setShowToast(true);
            setToastMessage(error?.response?.data?.errors[0].message || "Invalid");
        },
    });

    const triggerDeleteMenu = useMutation({
        mutationFn: (menuId) => menuApiUtil.delete(`${endPoints.getAllMenu}?menuId=${menuId}`),
        onSuccess: () => {
            setShowToast(true);
            setToastMessage("Menu Deleted successfully");
            triggerGetMenu.mutate({
                categoryCode: selectedCategory,
                page: currentMenuPage,
            });
            setIsModalVisible(false);
        },
        onError: (error) => {
            setShowToast(true);
            setToastMessage(error?.response?.data?.errors[0].msg || "Invalid");
        },
    });

    const handleDelete = (menuId, menuName) => {
        setMenuToDelete({ menuId, menuName });
        setIsModalVisible(true);
    };

    const handleOk = () => {
        if (menuToDelete) {
            triggerDeleteMenu.mutate(menuToDelete.menuId);
        }
    };

    const handleCancel = () => {
        setIsModalVisible(false);
        setMenuToDelete(null);
    };

    const handleEdit = (menuItem) => {
        setSelectedMenu(menuItem);
        setIsEditDrawerVisible(true);
    };

    const renderMenuItems = () => {
        if (menuList?.length === 0 && !showLoader) {
            return (
                <div className={styles.spinDataContainer}>
                    <Spin
                        className={styles.spinWrapper}
                        indicator={<Lottie animationData={nodataLottie} loop={true} />}
                    />
                    {"No Data Found"}
                </div>
            );
        }
        return menuList.map((menu) => (
            <div className={styles.menuList} key={menu.menuId}>
                <MenuItem
                    menuname={menu.menuName}
                    menucategory={menu.categoryName}
                    price={menu.price}
                    currency="INR"
                    image={menu.menuImageUrl}
                />
                {userInfo?.userRole !== "client_admin" && (
                    <div className={styles.modal}>
                        <div className={styles.editDownload}>
                            <Button
                                type="primary"
                                label="Edit"
                                onClick={() => handleEdit(menu)}
                                style={{ minWidth: "110px", marginTop: "6px" }}
                            />
                            <Button
                                type="primary"
                                label="Delete"
                                style={{ minWidth: "110px", marginBottom: "6px" }}
                                onClick={() => handleDelete(menu?.menuId, menu?.menuName)}
                            />
                        </div>
                    </div>
                )}
            </div>
        ));
    };

    const OperationsSlot = {
        left: page > 1 ? (
            <LeftCircleOutlined
                style={{
                    color: designPatterns.tableIconColor,
                    fontSize: stylesVariable.iconFontSize,
                }}
                onClick={() => setPage(page - 1)}
            />
        ) : null,
        right: onLoadDataCategory?.data?.data?.length >= 10 ? (
            <RightCircleOutlined
                style={{
                    color: designPatterns.tableIconColor,
                    fontSize: stylesVariable.iconFontSize,
                }}
                onClick={() => {
                    setPage(page + 1);
                    triggerGetMenu.mutate({
                        categoryCode: onloadCategoryList[0]?.categoryCode,
                        page: currentMenuPage,
                    });
                }}
            />
        ) : null,
    };

    const slot = useMemo(() => OperationsSlot, [page, onLoadDataCategory]);

    // Move rendering logic after all hooks
    if (isLoadingCategory) {
        return <LoaderLottie />;
    }

    if (isErrorCategory) {
        return <ErrorPage />;       
    }

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    {!location.pathname.includes("/addMenu") && userPermission.includes("read_write_menu") && (
                        <Flex vertical={false} gap={"1rem"} justify="center">
                            <Button
                                label="CategoryList"
                                type="secondary"
                                size="large"
                                onClick={toggleCategoryDrawer}
                            />
                            <Button
                                label="Add Menu"
                                icon={<PlusCircleFilled />}
                                iconPosition="end"
                                type="primary"
                                size="large"
                                onClick={toggleDrawer}
                            />
                        </Flex>
                    )}
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={menuPagebreadcrumbs} separator=">" />
                    <Title level={2}>{labels.menuTitle}</Title>
                </Flex>
                <Flex gap="middle" wrap className={styles.menuContainer}>
                    <Drawer title="Add New Menu" open={isDrawerVisible} onClose={toggleDrawer} width={400}>
                        <AddMenuDrawer
                            Category={onloadCategoryList}
                            onSave={handleSaveMenu}
                            isDrawerVisible={isDrawerVisible}
                            setIsHappened={setIsHappened}
                            onCategoryChange={() => refetch()}
                        />
                    </Drawer>
                    <Drawer title="Edit Menu" open={isEditDrawerVisible} onClose={toggleEditDrawer} width={400}>
                        <EditMenuDrawer
                            category={onloadCategoryList}
                            onSave={handleSaveMenu}
                            menuData={selectedMenu}
                            isEditDrawerVisible={isEditDrawerVisible}
                            setIsHappened={setIsHappened}
                            onCategoryChange={() => refetch()}
                        />
                    </Drawer>
                    <Drawer title="Category List" open={isCategoryDrawerVisible} onClose={toggleCategoryDrawer} width={400}>
                        <CategoryList
                            clientCode={userInfo?.clientInfo?.clientCode}
                            drawerOpen={isCategoryDrawerVisible}
                            setIsHappened={setIsHappened}
                            onCategoryChange={async () => {
                                await refetch();
                                setIsHappened(true);
                                // Force a refetch of the current category's menu items
                                if (onLoadDataCategory?.data?.data?.[0]?.categoryCode) {
                                    setSelectedCategory(onLoadDataCategory.data.data[0].categoryCode);
                                    triggerGetMenu.mutate({
                                        categoryCode: onLoadDataCategory.data.data[0].categoryCode,
                                        page: 1,
                                    });
                                    setShowLoader(true);
                                }
                            }}
                        />
                    </Drawer>
                    <ConfigProvider
                        theme={{
                            cssVar: true,
                            components: {
                                Tabs: {
                                    inkBarColor: designPatterns.buttonPrimary,
                                    itemSelectedColor: designPatterns.buttonPrimary,
                                    itemHoverColor: designPatterns.buttonPrimary,
                                },
                            },
                        }}
                    >
                        <Tabs
                            activeKey={selectedCategory}
                            onChange={(key) => handleCategoryClick(onloadCategoryList[parseInt(key)])}
                            tabPosition="top"
                            tabBarExtraContent={slot}
                            className={styles.tabClass}
                            items={onloadCategoryList?.map((category, index) => ({
                                key: index.toString(),
                                label: (
                                    <ConsumerButton
                                        key={category?.name}
                                        label={`${category?.name}`}
                                        onClick={() => handleCategoryClick(category)}
                                        type={selectedCategory === category?.categoryCode ? "primary" : "default"}
                                    />
                                ),
                            }))}
                        />
                    </ConfigProvider>
                </Flex>
                <Flex gap="middle" wrap>
                    {showLoader ? (
                        <div className={styles.spinContainer}>
                            <Spin
                                className={styles.spinWrapper}
                                indicator={<Lottie animationData={LoaderLottieJson} loop={true} />}
                            />
                        </div>
                    ) : (
                        renderMenuItems()
                    )}
                </Flex>
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
                        current={currentMenuPage}
                        total={totalMenuPages * itemsPerPage}
                        pageSize={itemsPerPage}
                        onChange={(page) => {
                            setCurrentMenuPage(page);
                            triggerGetMenu.mutate({
                                categoryCode: selectedCategory,
                                page: page,
                            });
                            setShowLoader(true);
                        }}
                        showSizeChanger={false}
                        showQuickJumper={false}
                        align="end"
                        style={{ textAlign: "right", marginTop: "20px" }}
                    />
                </ConfigProvider>
                <Toast message={toastMessage} visible={showToast} duration={2000} onClose={() => setShowToast(false)} />
                <Modal
                    title="Are you sure to delete this menu?"
                    open={isModalVisible}
                    onCancel={handleCancel}
                    footer={[
                        <Button key="cancel" label="Cancel" onClick={handleCancel} />,
                        <Button key="confirm" type="primary" label="Delete" onClick={handleOk} />,
                    ]}
                >
                    <p>This action will delete the menu: {menuToDelete?.menuName}</p>
                </Modal>
            </Content>
        </Layout>
    );
}

export default MenuPage;