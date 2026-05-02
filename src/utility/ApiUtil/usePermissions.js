import { useState, useEffect } from "react";

const usePermissions = () => {
    const [userPermission, setUserPermission] = useState([]);

    useEffect(() => {
        const permissions = JSON.parse(localStorage.getItem("permissionSet"));
        if (permissions) {
            setUserPermission(permissions);
        }
    }, []);

    return userPermission;
};

export default usePermissions;
