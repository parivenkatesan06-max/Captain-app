import React from "react"
import styles from "./ConsumerHeader.module.scss"
import backBtn from "../../../assets/Image/icons/backBtn.svg"
import { getUserInfo } from "../../../utility/userInfo"
import { useNavigate } from "react-router-dom"
import { Flex } from "antd"
import { ROLE_NAME } from "../../../utility/constants"

const ConsumerHeader = ({ cartText, itemsCountText, clientLogo }) => {

    const userInfo = getUserInfo()
    const Logo = () => {
        const clientName = userInfo?.clientName

        return (
            <img
                src={clientLogo}
                alt={`${clientName} logo`}
                className={styles.logo}
            />
        )
    }

    const navigate = useNavigate()
    const storedSeatCode = localStorage.getItem("seatCode");
    const storedClientCode = localStorage.getItem("clientCode");
    const storedEntityCode = localStorage.getItem("entityCode");
    // Handle the back button click
    const handleBackClick = () => {
        {userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN ?
            navigate("/counter/menuscreen") :
            navigate({
                pathname: "/consumer/homescreen",
                search: `?clientCode=${storedClientCode}&entityCode=${storedEntityCode}&seatCode=${storedSeatCode}`
            })
        }
    }

    const handleKeyDown = (event) => {
        // Trigger the click action when Enter or Space key is pressed
        if (event.key === "Enter" || event.key === " ") {
            handleBackClick()
        }
    }

    // Only render the mainContainer if cartText is provided
    if (!cartText) {
        return (
            <div className={styles.headerLogo}>
                <Logo />
            </div>
        )
    }

    return (
        <div className={styles.mainContainer}>
            <div className={styles.headerLogo}>
                <Logo />
            </div>

            {cartText && (
                <button
                    className={styles.backBtn}
                    onClick={handleBackClick}
                    onKeyDown={handleKeyDown}
                    tabIndex="0"
                    aria-label="Go back"
                >
                    <Flex vertical={false} style={{width:"100%"}}>
                        <img
                            src={backBtn}
                            alt="back-btn"
                            className={styles.backBtnImage}
                        />
                        <div className={styles.backBtnText}>{cartText}</div>
                    </Flex>
                    {itemsCountText && (
                        <div className={styles.backBtnContentText}>
                            {itemsCountText}
                        </div>
                    )}
                </button>
            )}
        </div>
    )
}

export default ConsumerHeader
