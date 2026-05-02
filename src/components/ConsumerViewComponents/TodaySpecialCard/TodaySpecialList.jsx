import React from "react"
import TodaySpecialCard from "./TodaySpecialCard"
import styles from "./TodaySpecialList.module.scss"
import { Col, Row, Typography } from "antd"

const TodaySpecialList = ({ data, title }) => {
    const { Title } = Typography

    return (
        <div className={styles.todaySpecialOfferContainer}>
            <Title level={4} className={styles.titleContainer}>
                {title}
            </Title>
            <Row>
                {data.map((item) => (
                    <Col key={item.menuId} span={12}>
                        <TodaySpecialCard key={item.menuId} item={item} />
                    </Col>
                ))}
            </Row>
        </div>
    )
}

export default TodaySpecialList
