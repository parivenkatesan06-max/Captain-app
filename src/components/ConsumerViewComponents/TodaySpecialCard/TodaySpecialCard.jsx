import React, { useState } from "react";
import { Card } from "antd";
import styles from "./TodaySpecialCard.module.scss";
import { useNavigate } from "react-router-dom";
import { getUserInfo } from "../../../utility/userInfo";
import { ROLE_NAME } from "../../../utility/constants";
import errorImage from "../../../assets/Image/imageNotFound.jpg";

const TodaySpecialCard = ({ item }) => {
    const navigate = useNavigate();
    const userInfo = getUserInfo();
    const [imageError, setImageError] = useState(false); // Track image error state

    const handleClick = () => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
            navigate("/counter/menuscreen", {
                state: { selectedCategoryName: item?.categoryName },
            });
        } else {
            navigate("/consumer/menuscreen", {
                state: { selectedCategoryName: item?.categoryName },
            });
        }
    };

    return (
        <>
            <Card
                hoverable
                className={styles.todaySpecialCard}
                onClick={handleClick}
            >
                <div className={styles.imageContainer}>
                    <img
                        alt={item.menuName}
                        src={imageError ? errorImage : item.menuImageUrl} // Use fallback image on error
                        className={styles.image}
                        onError={() => setImageError(true)}
                    />
                    <div
                        className={
                            imageError
                                ? styles.errorTitleOverlay
                                : styles.titleOverlay
                        }
                    >
                        {item.menuName}
                    </div>
                </div>
            </Card>
        </>
    );
};

export default TodaySpecialCard;
