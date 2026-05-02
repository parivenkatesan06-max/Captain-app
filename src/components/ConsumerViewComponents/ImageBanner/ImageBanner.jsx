import { Button, Typography } from "antd"
import React from "react"
import styles from "./ImageBanner.module.scss"
import bannerImage from "../../../assets/Image/pizza-piece.png"
import cokeImage from "../../../assets/Image/coke.png"
import { getUserInfo } from "../../../utility/userInfo"
import { ENTITY } from "../../../utility/constants"

const ImageBanner = () => {
    const { Title } = Typography
    const userInfo = getUserInfo()
    const imageUrl = userInfo.entity === ENTITY.HOTEL ? bannerImage : cokeImage;
    return (
        <>
            <div className={styles.titleContainer}>
                <Title level={3} className={styles.title}>
                    What would you like to eat ?
                </Title>
            </div>
            <div className={styles.imageContainer}>
                <div className={styles.imageBannerContainer}>
                    <img
                        src={imageUrl}
                        alt="captain-image"
                        className={styles.imageBanner}
                    />
                </div>
                <div className={styles.innerTitle}>
                    <Title level={4} className={styles.title}>
                        Order a set with 50% discount
                    </Title>
                    <Button className={styles.buttonText}>Order Now</Button>
                </div>
                <div className={styles.elipse}>
                    <div className={styles.elipseContainer}></div>
                </div>
            </div>
        </>
    )
}

export default ImageBanner
