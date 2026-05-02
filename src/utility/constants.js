import designPatterns from "../styles/base/_variables.module.scss"

export const TABLE_BOOKING_STATUS = {
    NOT_OCCUPIED: "Available",
    SERVED: "Served",
    CONFLICTS: "CONFLICTS",
    PAYMENT_PENDING: "payment_pending",
    PAID: "paid",
    OCCUPIED: "OCCUPIED",
    BOOKED: "Booked"
}

export const TABLE_BOOKING_STATUS_COLOR = {
    [TABLE_BOOKING_STATUS.NOT_OCCUPIED]: designPatterns.notOccupaidBgColor,
    [TABLE_BOOKING_STATUS.SERVED]: designPatterns.servedBgColor,
    [TABLE_BOOKING_STATUS.PAID]: designPatterns.paidColor,
    [TABLE_BOOKING_STATUS.PAYMENT_PENDING]: designPatterns.PaymentPendingBgColor,
    [TABLE_BOOKING_STATUS.BOOKED]:
        designPatterns.bookedBgColor,
}

export const ENTITY = {
    HOTEL: "Hotel",
    THEATRE: "Theatre"
}

export const ROLES = {
    ADMIN: "admin",
    CAPTAIN: "captain",
    KITCHENER:"kitchener"
}


export const OFFERNAME = {
    SPECIAL: "special",
    WEEKEND: "weekend",
    TODAYSPECIAL: "todaySpecial"
}

export const PERMISSION ={
    READ_WRITE_USER:"read_write_user",
    READ_WRITE_MENU:"read_write_menu",
    READ_WRITE_QRCODE:"read_write_qrcode",
    READ_WRITE_SCREENS:"read_write_screens",
    READ_WRITE_SETTINGS:"read_write_settings",
    READ_WRITE_REPORTS:"read_write_report",
    READ_WRITE_INVENTORY:"read_write_inventory",
    READ_USER:"read_user",
    READ_QRCODE:"read_qrcode",
    READ_MENU:"read_menu"
}

export const ERROR_CODE ={
    ER_ROW_IS_REFERENCED_2:"ER_ROW_IS_REFERENCED_2",
    FORCE_RESET_TEMPORORY_PASSWORD: "FORCE_RESET_TEMPORORY_PASSWORD",
    INVALID_TOKEN: "INVALID_TOKEN"
}

export const PATH ={
    CONSUMER: "consumer",
    HOMESCREEN: "homescreen"
}

export const ROLE_NAME ={
    CLIENT_ADMIN: "Client Admin",
    GROUP_ADMIN: "Group Admin"
}