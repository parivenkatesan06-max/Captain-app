import React, { useEffect, useState, useMemo, useRef, useCallback } from "react"
import styles from "./MobileMenuScreen.module.scss"
import MenuCard from "../../../components/ConsumerViewComponents/MenuCard/MenuCard"
import LoaderLottie from "../../../components/LoaderLottie/LoaderLottie"
import { ConfigProvider, Divider, Flex, Input, Layout, Skeleton, Spin, Tabs } from "antd"
import { useMutation, useQuery } from "@tanstack/react-query"
import ApiUtil from "../../../utility/ApiUtil"
import EndPoints from "../../../utility/EndPoints"
import { AudioOutlined, LeftCircleOutlined, RightCircleOutlined, SearchOutlined } from "@ant-design/icons"
import ConsumerHeader from "../../../components/ConsumerViewComponents/ConsumerHeader/ConsumerHeader"
import ConsumerButton from "../../../components/ConsumerViewComponents/ConsumerButton/ConsumerButton";
import SpeechRecognition, {
    useSpeechRecognition,
} from "react-speech-recognition"
import designerPattern from "../../../styles/base/_variables.module.scss"
import stylesVariable from "../../../styles/base/_stylesVariable.module.scss"
import { useLocation } from "react-router-dom"
import { getUserInfo } from "../../../utility/userInfo"
import { ROLE_NAME } from "../../../utility/constants"
import ErrorPage from "../../ErrorPage/ErrorPage"


// eslint-disable-next-line complexity
const MobileMenuScreen = () => {
    const [menuData, setMenuData] = useState([])
    const [selectedCategories, setSelectedCategories] = useState([])
    const [searchText, setSearchText] = useState("")
    const menuApiUtil = new ApiUtil()
    const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();
    const [onloadCategoryList, setOnloadCategoryList] = useState([])
    const [isLoader, setIsLoader] = useState(false)
    const location = useLocation()
    const { selectedCategoryName } = location.state || {};
    const [categoryPage, setCategoryPage] = useState(1)
    const [menuPage, setMenuPage] = useState(1)
    const userInfo = getUserInfo()
    const hasCategoryChanged = useRef(false);
    const [currentCategoryCode, setCurrentCategoryCode] = useState(null);
    const isFetchingMore = useRef(false)
    const hasMore = useRef(true)
    const [isLoadingMore,setIsLoadingMore] = useState(false)
    const menuContainerRef = useRef(null)
    const isInitialLoadRef = useRef(true);
    const [clientLogo,setClientLogo] = useState("")
    // Handle speech-to-text updates
    useEffect(() => {
        if (transcript) {
            setSearchText(transcript)
            resetTranscript()
        }
    }, [transcript])

    // Fetch categories
    const getAllMenuCategory = () =>
        menuApiUtil.get(
            `${EndPoints.menuCategory}?clientCode=${userInfo?.clientInfo?.clientCode}&page=${categoryPage}&itemsPerPage=10`
        );

    const { data: onLoadDataCategory, isLoadingCategory, isErrorCategory } = useQuery({
        queryKey: ["getAllMenuCategory", categoryPage],
        queryFn: getAllMenuCategory,
    });

    const handleInitialCategorySetup = useCallback((categoryList) => {
        if (!isInitialLoadRef.current) return;
        
        setOnloadCategoryList(categoryList);
        
        const selectedCategory = categoryList.find(
            (category) => category?.name === selectedCategoryName
        );

        if (shouldUpdateCategory(selectedCategory)) {
            handleCategoryMutation(selectedCategory?.categoryCode);
        } else if (!selectedCategory && categoryList.length > 0) {
            const firstCategory = categoryList[0];
            handleCategoryMutation(firstCategory?.categoryCode);
        }

        setIsLoader(true);
        setSelectedCategories(selectedCategoryName ? selectedCategoryName : categoryList[0]?.name);
        isInitialLoadRef.current = false;
    }, [selectedCategoryName, userInfo?.clientInfo?.clientCode]);

    useEffect(() => {
        if (onLoadDataCategory?.data?.data) {
            handleInitialCategorySetup(onLoadDataCategory.data.data);
        }
    }, [onLoadDataCategory, handleInitialCategorySetup]);

    const shouldUpdateCategory = (selectedCategory) => {
        return (
            selectedCategory &&
            selectedCategory?.categoryCode !== currentCategoryCode &&
            !hasCategoryChanged.current
        );
    };

    const handleCategoryMutation = (categoryCode) => {
        setCurrentCategoryCode(categoryCode);
        hasCategoryChanged.current = true;
        setMenuPage(1)
        setMenuData([])
        hasMore.current = true
        triggerGetMenu.mutate({ categoryCode, page: 1 });
    };

    const triggerGetMenu = useMutation({
        mutationFn: ({ categoryCode, page }) =>
            menuApiUtil.get(
                `${EndPoints.getAllMenu}?clientCode=${userInfo?.clientInfo?.clientCode}&categoryCode=${categoryCode}&page=${page}&itemsPerPage=10`
            ),
        onSuccess: (response, variables) => {
            const { page } = variables;
            setTimeout(() => {
                const data = response?.data?.data || [];
                setMenuData((prev) => (page === 1 ? data : [...prev, ...data]));
                if (data.length < 10) {
                    hasMore.current = false;
                }
                setIsLoader(false)
                setIsLoadingMore(false);
                hasCategoryChanged.current = false;
                isFetchingMore.current = false;
            }, 2000);
        },
        onError: (error) => {
            console.log("Fetch error:", error);
            isFetchingMore.current = false;
        },
    });

    // Scroll event handler
    const handleScroll = () => {
        if (!menuContainerRef.current || isFetchingMore.current || !hasMore.current) return;

        const { scrollTop, scrollHeight, clientHeight } = menuContainerRef.current;
        if (scrollHeight - scrollTop - clientHeight < 200 && !isFetchingMore.current) {
            isFetchingMore.current = true;
            setIsLoadingMore(true);
            setMenuPage((prev) => prev + 1);
            triggerGetMenu.mutate({ categoryCode: currentCategoryCode, page: menuPage + 1 });
        }
    };

    // Set up scroll listener
    useEffect(() => {
        const container = menuContainerRef.current;
        if (container) {
            container.addEventListener("scroll", handleScroll);
        }
        return () => {
            if (container) {
                container.removeEventListener("scroll", handleScroll);
            }
        };
    }, [menuData, currentCategoryCode, menuPage]);

    // Start/Stop listening for voice input
    const startListening = () => {
        setSearchText("")
        resetTranscript()
        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
        })
    }

    const stopListening = () => {
        SpeechRecognition.stopListening()
        resetTranscript()
    }

    const handleMicClick = () => {
        if (listening) {
            stopListening()
        } else {
            startListening()
        }
    }

    // Ensure speech recognition is supported
    if (!browserSupportsSpeechRecognition) {
        return <div>Your browser does not support speech recognition.</div>
    }

    const filteredMenus = useMemo(() => {
        return menuData.filter((menu) => {
            const matchesCategory = selectedCategories?.length
                ? selectedCategories?.includes(menu?.categoryName)
                : true;
            const matchesSearch = searchText.trim() === "" || (menu.menuName ?? "").toLowerCase().includes(searchText.toLowerCase()); 
            return matchesCategory && matchesSearch;
        });
    }, [menuData, selectedCategories, searchText]);

    const handleCategoryClick = (category) => {
        if (category?.categoryCode !== currentCategoryCode && !isFetchingMore.current) {
            setCurrentCategoryCode(category?.categoryCode);
            setSelectedCategories(category?.name === selectedCategories ? "" : category?.name);
            setIsLoader(true);
            handleCategoryMutation(category?.categoryCode);
        }
    };

    const handleSearchChange = (e) => {
        setSearchText(e.target.value);
    };

    if (isLoadingCategory) {
        return <LoaderLottie />;
    }

    if (isErrorCategory) {
        return (
            <ErrorPage/>
        );
    }

    const OperationsSlot = {
        left: categoryPage > 1 ? (
            <LeftCircleOutlined
                style={{
                    color: designerPattern.tableIconColor,
                    fontSize: stylesVariable.iconFontSize,
                }}
                onClick={() => categoryPage > 1 && setCategoryPage(categoryPage - 1)}
            />
        ) : null,
        right: onLoadDataCategory?.data?.data?.length >= 10 ? (
            <RightCircleOutlined
                style={{
                    color: designerPattern.tableIconColor,
                    fontSize: stylesVariable.iconFontSize,
                }}
                onClick={() => setCategoryPage(categoryPage + 1)}
            />
        ) : null,
    };

    const slot = useMemo(
        () => ({
            left: OperationsSlot.left,
            right: OperationsSlot.right,
        }),
        [categoryPage, onLoadDataCategory]
    );
    const { data: clientData } = useQuery({
        queryKey: ["clientLogo", userInfo?.clientInfo?.clientCode],
        queryFn: () => {
            const extractedClientCode = userInfo?.clientInfo?.clientCode?.split("-")[0];
            return menuApiUtil.get(`${EndPoints.client}/${extractedClientCode}`);
        },
        enabled: !!userInfo?.clientInfo?.clientCode,
        staleTime: Infinity,
        onError: (error) => {
            console.error("Failed to fetch client logo:", error);
        }
    });

    useEffect(() => {
        if (clientData?.data?.data) {
            const clientInfo = clientData.data.data;
            const specificClient = Array.isArray(clientInfo) 
                ? clientInfo.find(client => client.clientCode === userInfo?.clientInfo?.clientCode)
                : clientInfo;

            if (specificClient?.logo_url) {
                setClientLogo(specificClient.logo_url);
            }
        }
    }, [clientData, userInfo?.clientInfo.clientCode]);

    const mainContent = (
        <div
            className={styles.menu}
            ref={menuContainerRef}
        >
            <ConsumerHeader cartText="Menu list" itemsCountText="" clientLogo={clientLogo}/>

            {/* Search input */}
            <Input
                className={styles.searchInput}
                placeholder="Search anything..."
                prefix={<SearchOutlined />}
                value={searchText}
                onChange={handleSearchChange}
                suffix={
                    <Flex gap={10} alignitems="center">
                        <Divider
                            type="vertical"
                            style={{
                                fontSize: stylesVariable.oneRem,
                                backgroundColor: designerPattern.textPrimary,
                                marginLeft: stylesVariable.halfRem,
                                height: stylesVariable.onePointFiveRem,
                            }}
                        />
                        <AudioOutlined
                            className={styles.micIcon}
                            onClick={handleMicClick}
                            style={{
                                color: listening ? designerPattern.paidColor : designerPattern.menuItemPrimaryTextColor,
                                fontSize: "20px",
                                cursor: "pointer",
                            }}
                        />
                    </Flex>
                }
            />

            {/* Category filter buttons */}
            <Flex className={styles.categoryMenuButton}>
                {isLoadingCategory ? (
                    <Skeleton.Button active shape="round" size="large" />
                ) : (
                    <ConfigProvider
                        theme={{
                            cssVar: true,
                            components: {
                                Tabs: {
                                    inkBarColor: designerPattern.buttonPrimary,
                                    itemSelectedColor: designerPattern.buttonPrimary,
                                    itemHoverColor: designerPattern.buttonPrimary,
                                },
                            },
                        }}
                    >
                        <Tabs
                            activeKey={selectedCategories}
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
                                        type={selectedCategories === category?.name ? "primary" : "default"}
                                    />
                                ),
                            }))}
                        />
                    </ConfigProvider>
                )}
            </Flex>

            {/* Display filtered menu items */}
            <MenuCard menuData={filteredMenus} loading={isLoader} />
            {isLoadingMore && (
                <ConfigProvider
                    theme={{
                        cssVar: true,
                        components: {
                            Spin: {
                                colorPrimary: designerPattern.buttonPrimary,
                            },
                        },
                    }}
                >
                    <div className={styles.spinContainer}>
                        <Spin size="large" />
                    </div>
                </ConfigProvider>
            )}
        </div>
    );

    return userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ? (
        <Layout className="layoutWrapper">{mainContent}</Layout>
    ) : (
        mainContent
    );
};

export default MobileMenuScreen;