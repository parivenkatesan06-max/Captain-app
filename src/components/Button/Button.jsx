import React, { useContext } from "react"
import { Button as AntButton, ConfigProvider } from "antd"
import designPatterns from "../../styles/base/_variables.module.scss"
import buttonStyles from "./button.module.scss"
import { ThemeContext } from "../../utility/themeProvider";

function Button(props) {
    const { label } = props
    const { themeColors } = useContext(ThemeContext);
    
    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                token: {
                    colorPrimary:  themeColors.primary,
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

export default Button
