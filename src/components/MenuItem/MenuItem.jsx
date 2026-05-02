import React, { useState } from "react"
import { Card, Flex } from "antd"
import styles from "./MenuItem.module.scss"
import errorImage from "../../assets/Image/imageNotFound.jpg"

const MenuItem = (props) => {
    const { menuname, menucategory, price, currency, image } = props
    const [imageError, setImageError] = useState(false) 

    return (
        <Card
            cover={
                imageError ? (
                    <div className={styles.imageContainer}>
                        <img
                            alt={menuname}
                            src={errorImage}
                            className={styles.cardImage}
                        />
                        <div className={styles.overlayText}>{menuname}</div>
                    </div> 
                ) : (
                    <div className={styles.imageContainer}>
                        <img
                            alt={menuname}
                            src={image}
                            className={styles.cardImage}
                            onError={() => setImageError(true)} 
                        />
                    </div>
                )
            }
            className={styles.menuItem}
            {...props}
        >
            <Flex vertical={true}>
                <div className={styles.title}>{menuname}</div>
                <div className={styles.subtitle}>{menucategory}</div>
            </Flex>
            <Flex justify="space-between" align="center">
                <span className={styles.price}>{`${currency} ${price}`}</span>
            </Flex>
        </Card>
    )
}
export default MenuItem
