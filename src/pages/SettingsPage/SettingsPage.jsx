import React, { useContext, useState } from "react"
import { Layout, Flex, Typography } from "antd"
import PageHeader from "../../components/Header/Header"
import Breadcurmbs from "../../components/Breadcrumbs/Breadcurmbs"
import labels from "./SettingsPage.label.json"
import Button from "../../components/Button/Button"
import styles from "./SettingsPage.module.scss"
import { ReactComponent as LightOrange } from "../../assets/Image/theme/Orange.svg"
import { ReactComponent as Blue } from "../../assets/Image/theme/Blue.svg"
import { ReactComponent as Green } from "../../assets/Image/theme/Green.svg"
import { ReactComponent as Purple } from "../../assets/Image/theme/Purple.svg"
import { ReactComponent as Yellow } from "../../assets/Image/theme/Yellow.svg"
import { ReactComponent as Red } from "../../assets/Image/theme/Red.svg"
import { ReactComponent as ThemeIcom } from "../../assets/Image/icons/theme.svg"
import { ThemeContext } from "../../utility/themeProvider"
import { ArrowUpOutlined } from "@ant-design/icons"

const themeComponents = [
    { Component: LightOrange, className: "lightOrange", color: "#FFB74D" },
    { Component: Blue, className: "blue", color: "#42A5F5" },
    { Component: Green, className: "green", color: "#66BB6A" },
    { Component: Purple, className: "purple", color: "#AB47BC" },
    { Component: Yellow, className: "yellow", color: "#FFEB3B" },
    { Component: Red, className: "red", color: "#EF5350" },
]

function SettingsPage() {
    const { Header, Content } = Layout
    const { Title } = Typography
    const { theme, setTheme, doodleImages, setDoodle,doodle } = useContext(ThemeContext)
    const [disabledButton, setDisabledButton] = useState("theme")
    const [selectedDoodle, setSelectedDoodle] = useState(doodle); 

    const handleButtonClick = (buttonId) => {
        setDisabledButton(buttonId) // Set the clicked button as disabled
    }

    const tablePagebreadcrumbs = [
        {
            title: "Settings",
        },
    ]
    const renderEmptyplaceHolder = () => {
        return (
            <>
                {doodleImages.length > 0 && (
                    <Flex
                        style={{ rowGap: "22px", columnGap: "20px" }}
                        wrap={true}
                        className={styles.tableContainer}
                    >
                        {doodleImages.map((doodles, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDoodle(doodles)
                                    setSelectedDoodle(doodles) // Set selected doodle
                                    document.documentElement.style.setProperty(
                                        "--captain-bg-image",
                                        `url(${doodles})`
                                    )
                                }}
                                className={`${styles.doodleButton} ${selectedDoodle === doodles ? styles.selectedDoodle : ""}`} // Apply selectedDoodle class if it matches
                                style={{
                                    backgroundImage: `url(${doodles})`,
                                }}
                            />
                        ))}
                    </Flex>
                )}
            </>
        )
    }

    const getIconStyle = (isDeleted) => ({
        cursor: isDeleted ? "not-allowed" : "pointer",
        opacity: isDeleted ? 0.5 : 1,
    })

    return (
        <Layout className="layoutWrapper">
            <Header className="pageHeaderWrapper">
                <PageHeader>
                    <Flex gap={6} align="center">
                        <Button
                            label={"Doodle"}
                            style={{
                                color: "var(--primary-color)",
                                ...getIconStyle(disabledButton === "doodle"),
                            }}
                            onClick={() => {
                                handleButtonClick("doodle")
                            }}
                            icon={
                                <ArrowUpOutlined
                                    className={styles.uploadIcon}
                                    style={{ fontSize: "12px" }}
                                />
                            }
                            iconPosition="end"
                        />
                        <Button
                            type="primary"
                            label={"Theme"}
                            icon={<ThemeIcom />}
                            iconPosition="end"
                            style={{
                                ...getIconStyle(disabledButton === "theme"),
                            }}
                            onClick={() => {
                                handleButtonClick("theme")
                            }}
                        />
                    </Flex>
                </PageHeader>
            </Header>
            <Content className="contentWrapper">
                <Flex vertical>
                    <Breadcurmbs items={tablePagebreadcrumbs} separator=">" />
                    <Title level={2}>{labels?.pageTitle}</Title>
                </Flex>
                {disabledButton !== "theme" && renderEmptyplaceHolder()}
                <Flex
                    style={{ rowGap: "22px", columnGap: "20px" }}
                    wrap={true}
                    className={styles.tableContainer}
                >
                    {disabledButton === "theme" &&
                        themeComponents.map(
                            (
                                { Component: ThemeComponent, className },
                                index
                            ) => (
                                <ThemeComponent
                                    key={index}
                                    className={`${styles.theme} ${
                                        styles[className]
                                    } ${
                                        className === theme
                                            ? styles.selectedTheme
                                            : ""
                                    }`}
                                    onClick={() => setTheme(className)}
                                />
                            )
                        )}
                </Flex>
            </Content>
        </Layout>
    )
}

export default SettingsPage
