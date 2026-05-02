import React from "react"
import { Button as AntButton, ConfigProvider } from "antd"
import designPatterns from "../../../styles/base/_variables.module.scss"
import buttonStyles from "./ConsumerButton.module.scss"

function ConsumerButton(props) {
    const { label } = props
    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                token: {
                    colorPrimary: designPatterns.consumerButtonColor,
                    borderRadius: designPatterns.buttonRadius,
                },
            }}
        >
            <AntButton {...props} className={buttonStyles.buttonBase}>
                {label}
            </AntButton>
        </ConfigProvider>
    )
}

export default ConsumerButton