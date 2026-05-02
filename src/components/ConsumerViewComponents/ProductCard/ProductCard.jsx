import React, { useEffect, useState } from "react"
import Styles from "./ProductCard.module.scss"
import { Flex } from "antd"
import { useCart } from "../../../utility/CartUtils"
import errorImage from "../../../assets/Image/imageNotFound.jpg"

const ProductImage = ({ product, imageErrors, handleImageError }) => (
    <img
        src={imageErrors[product.menuId] ? errorImage : product.menuImageUrl}
        alt={product.menuName}
        className={Styles.productImage}
        onError={() => handleImageError(product.menuId)} // Handle error for this specific image
    />
)

const ProductDetails = ({ product, isEdit }) => (
    <Flex vertical gap={7} className={Styles.productDetails}>
        <h3 className={Styles.productTitle}>{product.menuName}</h3>
        <span className={Styles.priceUnit}>
            {!isEdit
                ? `Unit:  ${product.quantity}`
                : `Price per unit: ₹ ${product.price}`}
        </span>
    </Flex>
)

const ProductPrice = ({ product }) => (
    <Flex wrap justify="space-between" className={Styles.productPrice}>
        {product.offerPrice ? (
            <span className={Styles.originalPrice}>
                ₹
                {product.totalItemPrice
                    ? product.totalItemPrice
                    : product.price * product.quantity}{" "}
            </span>
        ) : null}
        <span className={Styles.discountedPrice}>
            {product?.offerPrice
                ? `₹${product.offerPrice * product.quantity}`
                : `₹${product?.price}`}
        </span>
    </Flex>
)

const QuantityControl = ({ product, handleIncrement, handleDecrement }) => (
    <div className={Styles.quantityControl}>
        <button
            onClick={() =>
                handleDecrement(product.menuId, product.quantity)
            }
            className={Styles.quantityBtn}
        >
            -
        </button>
        <span className={Styles.quantityValue}>{product.quantity}</span>
        <button
            onClick={() =>
                handleIncrement(product.menuId, product.quantity)
            }
            className={Styles.quantityBtn}
        >
            +
        </button>
    </div>
)

const ProductCard = ({ isEdit, orderItems }) => {
    const { cartItems, updateQuantity, removeFromCart } = useCart()
    const [products, setProducts] = useState([])
    const [imageErrors, setImageErrors] = useState({}) // Track errors for each image

    useEffect(() => {
        // If cartItems is empty, use orderItems as products, otherwise use cartItems
        if (cartItems.length === 0) {
            setProducts(orderItems)
        } else {
            setProducts(cartItems)
        }
    }, [cartItems, orderItems])

    const handleIncrement = (id, currentQuantity) => {
        const newQuantity = currentQuantity + 1
        updateQuantity(id, newQuantity) // Update in context and localStorage
    }

    const handleDecrement = (id, currentQuantity) => {
        if (currentQuantity === 1) {
            // Remove item from cart when quantity reaches 0
            removeFromCart(id) // Assuming removeFromCart is a function to remove items from the cart
        } else if (currentQuantity > 1) {
            const newQuantity = currentQuantity - 1
            updateQuantity(id, newQuantity) // Update in context and localStorage
        }
    }

    const handleImageError = (menuId) => {
        setImageErrors((prevErrors) => ({
            ...prevErrors,
            [menuId]: true, // Mark this menuId as having an error
        }))
    }

    return (
        <>
            {products.map((product) => (
                <div className={Styles.productCard} key={product.menuId}>
                    {/* Image Section */}
                    <ProductImage
                        product={product}
                        imageErrors={imageErrors}
                        handleImageError={handleImageError}
                    />

                    {/* Details Section */}
                    <ProductDetails product={product} isEdit={isEdit} />

                    <Flex vertical gap={10} className={Styles.buttonContainer}>
                        {/* Price Section */}
                        <ProductPrice product={product} />

                        {/* Quantity Control */}
                        {isEdit && (
                            <QuantityControl
                                product={product}
                                handleIncrement={handleIncrement}
                                handleDecrement={handleDecrement}
                            />
                        )}
                    </Flex>
                </div>
            ))}
        </>
    )
}

export default ProductCard
