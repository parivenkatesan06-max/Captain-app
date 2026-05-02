import React, { useState } from "react"
import {
    Card,
    Typography,
    Row,
    Col,
    Button,
    Flex,
    Skeleton,
    ConfigProvider,
} from "antd"
import styles from "./MenuCard.module.scss"
import NumberInput from "../../NumberInput/NumberInput"
import { useCart } from "../../../utility/CartUtils"
import designPatterns from "../../../styles/base/_variables.module.scss"
import stylesVariables from "../../../styles/base/_stylesVariable.module.scss"
import errorImage from "../../../assets/Image/imageNotFound.jpg"

const { Title, Text } = Typography

const MenuCard = ({ menuData, loading }) => {
    const { addToCart, updateQuantity, cartItems, removeFromCart } = useCart()
    const [imageErrors, setImageErrors] = useState({}) // Track errors for each image

    const getQuantity = (id) => {
        const cartItem = cartItems.find((item) => item.menuId === id)
        return cartItem ? cartItem.quantity : null
    }

    const handleQuantityChange = (id, value) => {
        const newValue = isNaN(value) || value < 1 ? 1 : value;
        updateQuantity(id, newValue);
    };

    const handleAddClick = (item) => {
        addToCart(item, 1);
    };
    const handleDecrement = (item) => {
        const currentQuantity = getQuantity(item.menuId) || 1
        if (currentQuantity > 1) {
            updateQuantity(item.menuId, currentQuantity - 1)
        } else {
            removeFromCart(item.menuId)
        }
    }

    const handleIncrement = (item) => {
        const currentQuantity = getQuantity(item.menuId) || 0
        updateQuantity(item.menuId, currentQuantity + 1)
    }

    const handleImageError = (menuId) => {
        setImageErrors((prevErrors) => ({
            ...prevErrors,
            [menuId]: true, // Mark this menuId as having an error
        }))
    }

    return (
        <Flex 
            wrap 
            justify="center" 
            className={`${styles.menuCardContainer} ${loading ? styles.loading : ""}`}
        >
            {loading
                ? // Skeleton Loader
                Array(4)
                    .fill()
                    .map((_, index) => (
                        <Card key={index} hoverable className={styles.card}>
                            <Row gutter={16} align="middle">
                                <Col span={12}>
                                    <div className={styles.cardContent}>
                                        <Skeleton.Input
                                            active
                                            style={{ width: 100 }}
                                        />
                                        <div className={styles.priceSection}>
                                            <Skeleton.Input
                                                active
                                                style={{ width: 60 }}
                                            />
                                        </div>
                                        <Skeleton
                                            active
                                            paragraph={{ rows: 1 }}
                                        />
                                    </div>
                                </Col>
                                <Col span={12}>
                                    <Skeleton.Image
                                        active
                                        style={{ width: 170, height: 140 }}
                                    />
                                </Col>
                            </Row>
                        </Card>
                    ))
                : // Actual Content
                menuData.map((item) => (
                    <Card key={item.menuId} hoverable className={styles.card}>
                        <Row align="middle">
                            <Col span={12}>
                                <div className={styles.cardContent}>
                                    <Title level={5}>{item.menuName}</Title>
                                    <div className={styles.priceSection}>
                                        {item.offerPrice < item.price && (
                                            <Text
                                                strong
                                                className={
                                                    styles.discountedPrice
                                                }
                                            >
                                                  ₹{item.offerPrice}
                                            </Text>
                                        )}
                                        <Text
                                            delete={
                                                item.offerPrice < item.price
                                            }
                                            className={
                                                item.offerPrice < item.price
                                                    ? styles.originalPrice
                                                    : ""
                                            }
                                        >
                                              ₹{item.price}
                                        </Text>
                                    </div>
                                    <Text>Serves - 1</Text>
                                    <Text>{item?.menuDescription}</Text>
                                </div>
                            </Col>
                            <Col span={12}>
                                <Flex className={styles.imageContainer}>
                                    {imageErrors[item.menuId] ? (
                                        <div className={styles.imageContainer}>
                                            <img
                                                alt={item.menuName}
                                                src={errorImage}
                                                className={styles.menuImage}
                                            />
                                            <div className={styles.overlayText}>{item.menuName}</div>
                                        </div> 
                                    ) : (                                     
                                        <img
                                            className={styles.menuImage}
                                            alt={item.menuName}
                                            src={item.menuImageUrl}
                                            onError={() => handleImageError(item.menuId)} // Handle error for this specific image
                                        />)  }

                                    <Flex
                                        justify="center"
                                        align="flex-end"
                                        className={styles.buttonContainer}
                                    >
                                        {getQuantity(item.menuId) == null ? (
                                            <ConfigProvider
                                                theme={{
                                                    cssVar: true,
                                                    token: {
                                                        colorPrimaryHover:
                                                              designPatterns.consumerButtonSecondaryColor,
                                                        colorPrimaryActive:
                                                              designPatterns.consumerButtonSecondaryColor,
                                                    },
                                                }}
                                            >
                                                <Button
                                                    type="primary"
                                                    className={styles.button}
                                                    onClick={() =>
                                                        handleAddClick(item)
                                                    }
                                                >
                                                      Add
                                                </Button>
                                            </ConfigProvider>
                                        ) : (
                                            <NumberInput
                                                style={{
                                                    width: stylesVariables.numberInputWidth,
                                                }}
                                                bgColor={
                                                    designPatterns.buttonHover
                                                }
                                                textColor={
                                                    designPatterns.consumerButtonColor
                                                }
                                                count={getQuantity(
                                                    item.menuId
                                                )}
                                                decrement={() =>
                                                    handleDecrement(item)
                                                }
                                                increment={() =>
                                                    handleIncrement(item)
                                                }
                                                onChange={(value) =>
                                                    handleQuantityChange(
                                                        item.menuId,
                                                        value
                                                    )
                                                }
                                            />
                                        )}
                                    </Flex>
                                </Flex>
                            </Col>
                        </Row>
                    </Card>
                ))}
        </Flex>
    )
}

export default MenuCard