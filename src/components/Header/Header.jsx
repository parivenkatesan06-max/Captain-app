import React from "react"
import { Flex } from "antd"

function PageHeader(props) {
    const { children } = props

    return (
        <Flex justify="flex-end" align="center">
            {children}
        </Flex>
    )
}

export default PageHeader
