const routePermissions = {
    "/": "read_write_menu",
    "/role": "read_write_user",
    "/role/user-list": "read_write_user",
    "/inventory": "read_write_inventory",
    "/reports": "read_write_report",
    "/settings": "read_write_settings",
    "/qr": "read_write_qrcode",
    "/role/create-new-user": "read_write_user",
    "/role/edit-user": "read_write_user",
    "/role/delete-user": "read_write_user",
    "/screens": "read_write_menu",  
    "/addQR": "read_write_qrcode",
    "/addMenu": "read_write_menu",
    "/order-history": "read_write_menu"
};

export const hasPermission = (userPermission, permission) => {
    return userPermission.includes(permission);
}

export const checkRoutePermission = (pathname, userPermission) => {

    // Check if the route matches the /screens base path (without dynamic segments)
    if (pathname.startsWith("/screens")) {
        const requiredPermissions = routePermissions["/screens"];
        return hasPermission(userPermission, requiredPermissions);
    }
    if (pathname.startsWith("/qr")) {
        const requiredPermissions = routePermissions["/qr"];
        return hasPermission(userPermission, requiredPermissions);
    }

    // For all other routes, check directly using the routePermissions object
    if (routePermissions[pathname]) {
        const requiredPermissions = routePermissions[pathname];
        if (Array.isArray(requiredPermissions)) {
            return requiredPermissions.some(permission => hasPermission(userPermission, permission));
        }
        return hasPermission(userPermission, requiredPermissions);
    }

    return false;
};
