// RoleButton.js
import React from "react"
import { Button, Row, Col } from "antd"
import styles from "./RoleLogoutMenu.module.scss"
import Logo from "../Logo/Logo";

const RoleButton = ({ userInfo }) => (
    <Button className={styles.roleButton}>
        <Row align="middle">
            <Col className={styles.userIcon}>
                <Logo className={styles.logoImage} />
            </Col>
            <Col className={styles.userInfo}>
                <div className={styles.userName}>
                    {userInfo?.roleInfo?.firstName} {userInfo?.roleInfo?.lastName}
                </div>
                <div className={styles.roleText}>{userInfo?.roleInfo?.roleName}</div>
            </Col>
        </Row>
    </Button>
)

export default RoleButton
