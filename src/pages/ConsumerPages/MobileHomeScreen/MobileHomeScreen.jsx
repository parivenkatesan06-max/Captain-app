import React, { useEffect, useMemo, useState, useRef, useCallback } from "react"
import { useLocation } from "react-router-dom"
import styles from "./MobileHomeScreen.module.scss"
import {
    ConfigProvider,
    Divider,
    Flex,
    Input,
    Skeleton,
    Tabs,
    Layout,
} from "antd"
import TodaySpecialList from "../../../components/ConsumerViewComponents/TodaySpecialCard/TodaySpecialList"
import ApiUtil from "../../../utility/ApiUtil"
import EndPoints from "../../../utility/EndPoints"
import { getUserInfo, setUserInfo } from "../../../utility/userInfo"
import { useMutation, useQuery } from "@tanstack/react-query"
import SpecialOffer from "../../../components/ConsumerViewComponents/SpecialOffer/SpecialOffer"
import { ReactComponent as Table } from "../../../assets/Image/icons/Table-color.svg"
import { ReactComponent as Screen } from "../../../assets/Image/icons/Theatre.svg"
import {
    AudioOutlined,
    LeftCircleOutlined,
    RightCircleOutlined,
    SearchOutlined,
} from "@ant-design/icons"
import ImageBanner from "../../../components/ConsumerViewComponents/ImageBanner/ImageBanner"
import ConsumerHeader from "../../../components/ConsumerViewComponents/ConsumerHeader/ConsumerHeader"
import ConsumerButton from "../../../components/ConsumerViewComponents/ConsumerButton/ConsumerButton";
import { ENTITY, OFFERNAME, ROLE_NAME } from "../../../utility/constants"
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition"
import designerPattern from "../../../styles/base/_variables.module.scss"
import stylesVariable from "../../../styles/base/_stylesVariable.module.scss"
import LoaderLottie from "../../../components/LoaderLottie/LoaderLottie"
import TodaySpecialCardSkeleton from "../../../components/ConsumerViewComponents/TodaySpecialCard/TodaySpecialCardSkeleton"
import PageHeader from "../../../components/Header/Header"
import ErrorPage from "../../ErrorPage/ErrorPage"

const useFilteredMenu = (menuList, selectedCategory, searchText) => {
    return (
        menuList &&
    menuList.filter((menu) => {
        const matchesCategory = selectedCategory
            ? menu.categoryName === selectedCategory
            : true;
        const matchesSearch =
        searchText.trim() === "" ||
        (menu.menuName ?? "").toLowerCase().includes(searchText.toLowerCase());
        return matchesCategory && matchesSearch;
    })
    )
}

// eslint-disable-next-line complexity
const MobileHomeScreen = () => {
    const menuApiUtil = new ApiUtil()
    const location = useLocation()
    const searchParams = new URLSearchParams(location.search)

    const userInfo = getUserInfo()
    const entityCode = searchParams.get("entityCode")
    const seatCode = searchParams.get("seatCode") || userInfo?.seatCode;
    const clientCode = searchParams.get("clientCode") || userInfo?.clientInfo?.clientCode;

    const [greeting, setGreeting] = useState("")
    const [selectedCategory, setSelectedCategory] = useState("")
    const [searchText, setSearchText] = useState("")
    const { transcript, listening, browserSupportsSpeechRecognition, resetTranscript } =
    useSpeechRecognition()
    const [onloadCategoryList,setOnloadCategoryList] = useState([])
    const [menuList, setMenuList] = useState([])
    const [isloader,setIsLoader] = useState(false)
    const [page,setPage] = useState(1)
    const [seatNumber,setSeatNumber] = useState("")
    const isClientAdmin = userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN;
    const { Header } = Layout;
    const initialLoadRef = useRef(true);
    const [isCategoryChangeInProgress, setIsCategoryChangeInProgress] = useState(false);
    const [clientLogo, setClientLogo] = useState(null);
    useEffect(() => {
        if (transcript) {
            setSearchText(transcript)
            resetTranscript();
        }
    }, [transcript])
    useEffect(() => {
        if (entityCode && seatCode && clientCode) {
            setUserInfo({
                entityCode: entityCode,
                seatCode: seatCode,
                clientCode:clientCode
            })
        }
    }, [entityCode, seatCode, clientCode])

    const triggerGetMenu = useMutation({
        mutationFn: (categoryCode) =>
            menuApiUtil.get(
                `${EndPoints.getAllMenu}?clientCode=${clientCode}&categoryCode=${categoryCode}`
            ),
        onSuccess: (response) => {
            setTimeout(() => {
                const data = response?.data?.data
                setMenuList(data)
                setIsLoader(false)
            }, 2000);
        },
        onError: (error) => {
            console.log(error)
        },
    })

    const getAllMenuCategory = () =>
        menuApiUtil.get(
            `${EndPoints.menuCategory}?clientCode=${clientCode}&page=${page}&itemsPerPage=10`
        );

    const { data: onLoadDataCategory, isLoadingCategory, isErrorCategory } = useQuery({
        queryKey: ["getAllMenuCategory", page],
        queryFn: getAllMenuCategory,
        enabled: !isClientAdmin,
        staleTime: 30000,
        cacheTime: 60000
    });
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
    useEffect(() => {
        const hours = new Date().getHours()
        if (hours < 12) {
            setGreeting("Good morning!")
        } else if (hours >= 12 && hours < 18) {
            setGreeting("Good afternoon!")
        } else {
            setGreeting("Good evening!")
        }
    }, [])

    useEffect(() => {
        if (onLoadDataCategory?.data?.data && initialLoadRef.current) {
            const categoryList = onLoadDataCategory?.data?.data;
            setOnloadCategoryList(categoryList);
            
            if (Array.isArray(categoryList) && categoryList.length > 0 && categoryList[0]?.categoryCode) {
                initialLoadRef.current = false;
                triggerGetMenu.mutate(categoryList[0]?.categoryCode);
                setIsLoader(true);
                setSelectedCategory(categoryList[0]?.name);
            }
        }
    }, [onLoadDataCategory]);

    const filteredTodaySpecialList = useFilteredMenu(
        menuList,
        selectedCategory,
        searchText
    )

    let filteredSpecialOfferList = []
    let filteredWeekendSaleList = []
    let filteredTodaySpecialOfferList = []

    if (userInfo?.entity === ENTITY.HOTEL) {
        // Apply filters for hotel
        filteredSpecialOfferList = filteredTodaySpecialList.filter(
            (item) => item.offerName === OFFERNAME.SPECIAL
        )
        filteredWeekendSaleList = filteredTodaySpecialList.filter(
            (item) => item.offerName === OFFERNAME.WEEKEND
        )
        filteredTodaySpecialOfferList = filteredTodaySpecialList.filter(
            (item) => item.offerName === OFFERNAME.TODAYSPECIAL
        )
    }
    if (isLoadingCategory) {
        return <LoaderLottie />
    }

    if (isErrorCategory) {
        return (
            <ErrorPage/>
        )
    }

    // Category Button click handler
    const handleCategoryClick = useCallback((category) => {
        if (isCategoryChangeInProgress || !category?.categoryCode) return;
        
        setIsCategoryChangeInProgress(true);
        const newCategory = category?.name === selectedCategory ? "" : category?.name;
        setSelectedCategory(newCategory);
        
        triggerGetMenu.mutate(category?.categoryCode);
        setIsLoader(true);
        
        setTimeout(() => {
            setIsCategoryChangeInProgress(false);
        }, 100);
    }, [selectedCategory, isCategoryChangeInProgress, triggerGetMenu]);

    const handleSearchChange = (e) => {
        setSearchText(e.target.value)
    }

    const RenderTheatrelist = () => {
        return (
            filteredTodaySpecialList.length > 0 &&
      userInfo.entity === ENTITY.THEATRE && (
                <TodaySpecialList
                    data={filteredTodaySpecialList}
                    title="Recommended"
                />
            )
        )
    }
    const RenderIcon = () => {
        return userInfo.entity === ENTITY.HOTEL ? <Table /> : <Screen />
    }

    // Start/Stop listening for voice input
    const startListening = () => {
        setSearchText("")
        resetTranscript();
        SpeechRecognition.startListening({
            continuous: true,
            language: "en-US",
        })
    }

    const stopListening = () => {
        SpeechRecognition.stopListening()
        resetTranscript();
    }


    const handleMicClick = () => {
        if (listening) {
            stopListening()
        } else {
            startListening()
        }
    }

    if (!browserSupportsSpeechRecognition) {
        return <div>Your browser does not support speech recognition.</div>
    }

    const OperationsSlot = {
        left:
      page > 1 ? (
          <LeftCircleOutlined
              style={{
                  color: designerPattern.tableIconColor,
                  fontSize: stylesVariable.iconFontSize,
              }}
              onClick={() => page > 1 && setPage(page - 1)}
          />
      ) : null, // Hide the left icon if on the first page
        right: onLoadDataCategory?.data?.data?.length >= 10 ? (
            <RightCircleOutlined
                style={{
                    color: designerPattern.tableIconColor,
                    fontSize: stylesVariable.iconFontSize,
                }}
                onClick={() => {
                    setPage(page + 1); // Update the page
                    triggerGetMenu.mutate(onloadCategoryList[0]?.categoryCode);
                }}
            />
        ) : null,
    };

    // Then use the slot like this
    const slot = useMemo(
        () => ({
            left: OperationsSlot.left,
            right: OperationsSlot.right,
        }),
        [page, onLoadDataCategory]
    );
    useEffect(() => {
        if (seatCode && seatCode !== "undefined") {
            const extractedSeatNumber = seatCode.replace(/.*-(?=[^-]*$)/, "");
            setSeatNumber(extractedSeatNumber);
        } 
    }, [seatCode]);


    const mainContent = (
        <div className={styles.mainContainer}>
            <div className={styles.contentContainer}>
                <ConsumerHeader clientLogo={clientLogo} />
                <div className={styles.headerContainer}>
                    {isLoadingCategory ? (
                        <>
                            <Skeleton.Input active size={"default"} />
                            <Flex gap={10} align="center">
                                <Skeleton.Avatar active size={"default"} shape={"square"} />
                                <Skeleton.Button active size={"default"} shape={"default"} />
                            </Flex>
                        </>
                    ) : (
                        <>
                            <div className={styles.title}>{greeting}</div>
                            <Flex gap={10} align="center">
                                {seatNumber && (
                                    <>
                                        {RenderIcon()}
                                        <div>{seatNumber}</div>
                                    </>
                                )}
                            </Flex>
                        </>
                    )}
                </div>
                {isLoadingCategory ? (
                    <Skeleton.Button active size={"default"} shape={"round"} block={true} />
                ) : (
                    <Input
                        className={styles.searchInput}
                        placeholder="Search anything..."
                        prefix={<SearchOutlined />}
                        value={searchText}
                        onChange={handleSearchChange}
                        suffix={
                            <Flex gap={10} align="center">
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
                                        color: listening
                                            ? designerPattern.paidColor
                                            : designerPattern.menuItemPrimaryTextColor,
                                    }}
                                />
                            </Flex>
                        }
                    />
                )}
            </div>
            <ImageBanner />
            {/* Category Buttons */}
            <Flex className={styles.categoryButton}>
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
                            activeKey={selectedCategory}
                            onChange={(key) => {
                                if (!isCategoryChangeInProgress) {
                                    handleCategoryClick(onloadCategoryList[parseInt(key)])
                                }
                            }}
                            tabPosition="top"
                            tabBarExtraContent={slot}
                            className={styles.tabClass}
                            items={onloadCategoryList?.map((category, index) => ({
                                key: index.toString(),
                                label: (
                                    <ConsumerButton
                                        key={category?.name}
                                        label={`${category?.name}`}
                                        onClick={() => !isCategoryChangeInProgress && handleCategoryClick(category)}
                                        type={selectedCategory === category?.name ? "primary" : "default"}
                                    />
                                ),
                            }))}
                        />
                    </ConfigProvider>
                )}
            </Flex>
            {isloader ? (
                <TodaySpecialCardSkeleton/>
            ):(
                RenderTheatrelist()
            )}
            {filteredTodaySpecialOfferList.length > 0 && (
                <TodaySpecialList
                    data={filteredTodaySpecialOfferList}
                    title="Today's Special"
                />
            )}

            {/* Display filtered Special Offer List */}
            {filteredSpecialOfferList.length > 0 &&  (
                <SpecialOffer
                    data={filteredSpecialOfferList}
                    title="Special Offers"
                />
            )}

            {/* Display filtered Weekend Sale */}
            {filteredWeekendSaleList.length > 0 && (
                <SpecialOffer
                    data={filteredWeekendSaleList}
                    title="Weekend Sale"
                />
            )}
        </div>
    );

    return isClientAdmin ? (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader />
            </Header>
            {mainContent}
        </Layout>
    ) : (
        mainContent 
    );
};

export default MobileHomeScreen
