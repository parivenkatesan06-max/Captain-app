import React from "react"
import { ReactComponent as Dashboard } from "../../assets/Image/icons/dashboard.svg"
import { ReactComponent as DashboardWhite } from "../../assets/Image/icons/dashboard-white.svg"
import { ReactComponent as Menulist } from "../../assets/Image/icons/menu.svg"
import { ReactComponent as MenulistWhite } from "../../assets/Image/icons/menu-white.svg"
import { ReactComponent as Table } from "../../assets/Image/icons/Table.svg"
import { ReactComponent as TableWhite } from "../../assets/Image/icons/table-white.svg"
import { ReactComponent as QR } from "../../assets/Image/icons/qr.svg"
import { ReactComponent as QRWhite } from "../../assets/Image/icons/qr-white.svg"
import { ReactComponent as Role } from "../../assets/Image/icons/role.svg"
import { ReactComponent as RoleWhite } from "../../assets/Image/icons/role-white.svg"
import { ReactComponent as Inventory } from "../../assets/Image/icons/inventory.svg"
import { ReactComponent as InventoryWhite } from "../../assets/Image/icons/inventory-white.svg"
import { ReactComponent as Settings } from "../../assets/Image/icons/settings.svg"
import { ReactComponent as SettingsWhite } from "../../assets/Image/icons/settings-white.svg"
import { ReactComponent as Reports } from "../../assets/Image/icons/reports.svg"
import { ReactComponent as ReportsWhite } from "../../assets/Image/icons/reports-white.svg"
import Styles from "./SideNavBar.module.scss"

// Mapping of icon keys to their respective SVG components
const iconMap = {
    dashboard: { default: <Dashboard />, selected: <DashboardWhite /> },
    menu: { default: <Menulist />, selected: <MenulistWhite /> },
    table: { default: <Table />, selected: <TableWhite /> },
    qr: { default: <QR />, selected: <QRWhite /> },
    role: { default: <Role />, selected: <RoleWhite /> },
    inventory: { default: <Inventory />, selected: <InventoryWhite /> },
    settings: { default: <Settings />, selected: <SettingsWhite /> },
    reports: { default: <Reports />, selected: <ReportsWhite /> },
    counterSales : {default : <Menulist/>, selected: <MenulistWhite/>},
    orderHistory: {default: <Dashboard />, selected: <DashboardWhite /> }
}

// CustomIcon component
const CustomIcon = ({ iconKey, isSelected }) => {
    const Icon = isSelected
        ? iconMap[iconKey].selected
        : iconMap[iconKey].default
    return <span className={Styles.iconContainer}>{Icon}</span>
}

export default CustomIcon
