import React, { useEffect } from "react"
import { message } from "antd"

const CustomMessage = ({ isVisible, type, content, duration }) => {
    const [messageApi, contextHolder] = message.useMessage()

    useEffect(() => {
        if (isVisible) {
            messageApi.open({
                type,
                content,
                duration,
                style: {
                    marginTop: "50vh",
                },
            })
        }
    }, [isVisible, type, content, duration, messageApi])

    return (
        <>
            {contextHolder}
        </>
    )
}

export default CustomMessage
