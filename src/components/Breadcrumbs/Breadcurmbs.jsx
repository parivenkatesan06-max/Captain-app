import React from "react"
import { Breadcrumb, ConfigProvider } from "antd"
import designPatterns from "../../styles/base/_variables.module.scss"

function Breadcurmbs(props) {

    return (
        <ConfigProvider
            theme={{
                cssVar: true,
                components: {
                    Breadcrumb: {
                        itemColor: designPatterns.textSecondary,
                        linkColor: designPatterns.textSecondary,
                        lastItemColor: designPatterns.buttonPrimary,
                    },
                },
            }}
        >
            <Breadcrumb {...props} />
        </ConfigProvider>
    )
}

export default Breadcurmbs
