import React, { useState, useEffect, useMemo } from "react"
import { Layout, Menu } from "antd"
import { useNavigate, useLocation } from "react-router-dom"
import Logo from "../Logo/Logo"
import RoleLogoutMenu from "../RolebasedLogout/RoleLogoutMenu"
import CustomIcon from "./CustomIcon"
import styles from "./SideNavBar.module.scss"
import { ENTITY, PERMISSION, ROLE_NAME } from "../../utility/constants"
import { getUserInfo } from "../../utility/userInfo"

function SideNavBar({ permissions }) {
    const navigate = useNavigate()
    const location = useLocation()
    const [selectedKey, setSelectedKey] = useState("1")
    const userInfo = getUserInfo();

    // Define items array with path properties for routing
    const items = [
        {
            key: "1",
            iconKey: "menu",
            label: "Menu",
            path: "/",
            permission: PERMISSION.READ_WRITE_MENU,
        },
        {
            key: "2",
            iconKey: "table",
            label: "Table",
            path: "/table",
            permission: PERMISSION.READ_WRITE_MENU,
        },
        {
            key: "3",
            iconKey: "qr",
            label: "QR code",
            path: "/qr",
            permission: PERMISSION.READ_WRITE_QRCODE,
        },
        {
            key: "8",
            iconKey: "table",
            label: "Screens",
            path: "/screens",
            permission: PERMISSION.READ_WRITE_MENU,
        },
        {
            key: "4",
            iconKey: "role",
            label: "Role",
            path: "/role",
            permission: PERMISSION.READ_WRITE_USER,
        },
        {
            key: "5",
            iconKey: "inventory",
            label: "Inventory",
            path: "/inventory",
            permission: PERMISSION.READ_WRITE_INVENTORY,
        },
        {
            key: "6",
            iconKey: "settings",
            label: "Settings",
            path: "/settings",
            permission: PERMISSION.READ_WRITE_SETTINGS,
        },
        {
            key: "7",
            iconKey: "reports",
            label: "Reports",
            path: "/reports",
            permission: PERMISSION.READ_WRITE_REPORTS,
        },
        {
            key: "9",
            iconKey: "counterSales",
            label: "Counter Sales",
            path: "/counter/menuscreen",
        },
        {
            key: "10",
            iconKey: "orderHistory",
            label: "Order History",
            path: "/order-history",
            permission: PERMISSION.READ_WRITE_MENU,
        }
    ]

    // Filter menu items based on user permissions, entity type, and role
    const menuList = useMemo(() => {
        // let filteredItems = items.filter(item => permissions.includes(item.permission))
        let filteredItems = items.filter(item => {
            // Check for Counter Sales specifically
            if (item.key === "9") {
                return userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN;
            }
            // For other items, check permissions if they exist
            return permissions.includes(item.permission) ;
        });

        if (userInfo?.entity === ENTITY.HOTEL) {
            filteredItems = filteredItems.filter(item => item.label !== "Screens")
        } else if (userInfo?.entity === ENTITY.THEATRE) {
            filteredItems = filteredItems.filter(item => item.label !== "Table")
        }

        return filteredItems
    }, [permissions, userInfo?.entity, userInfo?.roleInfo?.roleName])

    // Update the selected menu item based on the current route
    useEffect(() => {
        const pathSegments = location.pathname.split("/").filter(Boolean)

        const currentItem = menuList.find((item) => {
            const itemSegments = item.path.split("/").filter(Boolean)
            return pathSegments[0] === itemSegments[0]
        })

        if (currentItem) {
            setSelectedKey(currentItem.key)
        }
    }, [location.pathname, menuList])

    const handleMenuClick = ({ key }) => {
        setSelectedKey(key)
        const selectedItem = menuList.find((item) => item.key === key)
        if (selectedItem) {
            navigate(selectedItem.path)
        }
    }

    return (
        <Layout.Sider
            breakpoint="lg"
            collapsedWidth={90}
            className={styles.customSidebar}
            width={250}

        >
            <div className={styles.sidebarLogo}>
                <Logo className={styles.logoImage} />
            </div>
            <div className={styles.siderBody}>
                <Menu
                    theme="light"
                    mode="inline"
                    selectedKeys={[selectedKey]}
                    onClick={handleMenuClick}
                    className={styles.customSidebarMenu}
                >
                    {menuList.map(({ key, iconKey, label }) => (
                        <Menu.Item key={key} icon={<CustomIcon iconKey={iconKey} isSelected={selectedKey === key} />}>
                            {label}
                        </Menu.Item>
                    ))}
                </Menu>
                <RoleLogoutMenu />
            </div>
        </Layout.Sider>
    )
}

export default SideNavBar
