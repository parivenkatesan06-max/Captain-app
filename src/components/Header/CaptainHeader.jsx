import React from "react"
import { Flex, Typography } from "antd"
import styles from "./Header.module.scss"
import Logo from "../Logo/Logo"

function CaptainHeader(props) {
    const { children, title } = props
    const { Title } = Typography

    return (
        <Flex justify="space-between" align="center" className={styles.captainHeader} >
            <Flex gap={40} align="center">
                <Logo className={styles.logoImage} />
                <Title level={2}>{title}</Title>
            </Flex>
            <Flex>{children}</Flex>
        </Flex>
    )
}

export default CaptainHeader
