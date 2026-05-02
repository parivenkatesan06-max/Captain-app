import React from "react"
import { Card, Flex, Skeleton, Space } from "antd"
import styles from "./TodaySpecialCard.module.scss"

const TodaySpecialCardSkeleton = () => {
    return (
        <>
            <Skeleton.Input active={true} size={"default"} />
            <div className={styles.todaySpecialOfferContainer}>
                { Array(2)
                    .fill()
                    .map((_, index) => (
                        <Card  key={index} hoverable className={styles.todaySpecialCardSkeleton}>
                            <Flex gap="middle" vertical>
                                <Space>
                                    <Skeleton.Input active />
                                </Space>
                                <Space>
                                    <Skeleton.Input active />
                                </Space>
                                <Space>
                                    <Skeleton.Input active />
                                </Space>
                            </Flex>
                        </Card>))}
            </div>
        </>
    )
}

export default TodaySpecialCardSkeleton
