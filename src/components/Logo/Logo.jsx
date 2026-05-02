import React from "react"
import { getUserInfo } from "../../utility/userInfo"
import styles from "./Logo.module.scss"



const Logo = () => {
    const userInfo = getUserInfo()

    return (
        <img
            src={userInfo?.clientLogo}
            alt="logo"
            className={styles.logoImage}
        />
    )
}

export default Logo