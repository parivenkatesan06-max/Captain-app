import React from "react"
import styles from "./SpecialOffer.module.scss"
import { Card, Col, Flex, Row, Typography } from "antd"
import { useNavigate } from "react-router-dom"

const SpecialOffer = ({ data, title }) => {
    const { Title } = Typography
    const navigate = useNavigate()
    const handleClick = () => {
        navigate("/consumer/menuscreen")
    }

    return (
        <div className={styles.specialOfferContainer}>
            <Title level={4} className={styles.titleContainer}>
                {title}
            </Title>
            <Flex wrap gap={15}>
                <Row>
                    {data.map((item) => (
                        <Col key={item.menuId} span={12}>
                            <Card
                                key={item.menuId}
                                hoverable
                                className={styles.specialOfferCard}
                                onClick={handleClick}
                            >
                                <div className={styles.contentBox}>
                                    <div className={styles.titleBox}>
                                        {item.menuName}
                                    </div>
                                    <div className={styles.offerBox}>
                                        {item?.menuDescription}
                                    </div>
                                    <div className={styles.offerPercent}>
                                        {`${item?.offerPct}%  Off`}
                                    </div>
                                </div>
                                <div className={styles.imageContainer}>
                                    <img
                                        alt={item.menuName}
                                        src={item.menuImageUrl}
                                        className={styles.image}
                                    />
                                </div>
                            </Card>
                        </Col>
                    ))}
                </Row>
            </Flex>
        </div>
    )
}

export default SpecialOffer
