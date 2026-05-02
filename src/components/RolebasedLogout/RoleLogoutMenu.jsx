import React from "react"
import { useMutation } from "@tanstack/react-query"
import { useNavigate } from "react-router-dom"
import { Button, Row } from "antd"
import apiUtil from "../../utility/ApiUtil/ApiUtil"
import { ReactComponent as LogoutIcon } from "../../assets/Image/icons/logout.svg"
import styles from "./RoleLogoutMenu.module.scss"
import endPoints from "../../utility/EndPoints"
import RoleButton from "./RoleDropdown"
import { getUserInfo, resetUserInfo } from "../../utility/userInfo"

const LogoutButton = ({ onLogout }) => (
    <Row align="middle" className={styles.logoutWrapper}>
        <Button
            type="link"
            icon={<LogoutIcon />}
            className={styles.logout}
            onClick={onLogout}
        >
            <div className={styles.hiddenText}>Logout</div>
        </Button>
    </Row>
)

const RoleLogoutMenu = () => {
    const userInfo = getUserInfo()
    const navigate = useNavigate()
    const logoutApiUtil = new apiUtil()

    async function logoutValidation() {
        const accessToken = sessionStorage.getItem("accessToken")
        if (!accessToken) throw new Error("No access token found.")
        return logoutApiUtil.post(endPoints.logout, { token: accessToken })
    }

    const {
        mutate: triggerLogout,
        isError,
        error,
    } = useMutation({
        mutationFn: logoutValidation,
        onSuccess: () => {
            resetUserInfo()
            navigate("/login")
            sessionStorage.removeItem("refresh_token_expiry");
            localStorage.removeItem("currentPage")
        },
        onError: (err) => {
            console.error("Logout Error: ", err)
            resetUserInfo() //as of now we dont have logout call in future we have to handle
            navigate("/login") //as of now we dont have logout call in future we have to handle
            sessionStorage.removeItem("refresh_token_expiry");
            localStorage.removeItem("currentPage")
        },
    })

    return (
        <div className={styles.roleLogoutMenu}>
            <div className={styles.roleButtonWrapper}>
                <RoleButton userInfo={userInfo} />
            </div>

            <LogoutButton onLogout={() => triggerLogout()} />

            {isError && (
                <div className={styles.error}>
                    Error logging out: {error.message}
                </div>
            )}
        </div>
    )
}

export default RoleLogoutMenu
