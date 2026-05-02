export const USER_INFO = {
    ACCESS_TOKEN: "accessToken",
    ROLE: "role",
    EMAIL: "email",
    ENTITY_NAME: "entity",
    CLIENT_NAME: "clientname",
    CLIENT_ID: "clientId",
    IDENTIFIER: "identifier",
    FIRST_NAME: "firstName",
    LAST_NAME: "lastName",
    CLIENT_GROUP_CODE: "clientGroupCode",
    CLIENT_CODE: "clientCode",
    ROLE_CODE: "roleCode",
    ROLE_NAME: "roleName",
    PERMISSION_SET:"permissionSet",
    REFRESH_TOKEN: "refreshToken",
    ENTITY_CODE:"entityCode",
    SEAT_CODE:"seatCode",
    CLIENT_LOGO:"clientLogo"
}

export function setUserInfo(userInfo) {
    sessionStorage.setItem(USER_INFO.ACCESS_TOKEN, userInfo?.accessToken);
    localStorage.setItem(USER_INFO.ROLE, userInfo?.role);
    localStorage.setItem(USER_INFO.EMAIL, userInfo?.email);
    localStorage.setItem(USER_INFO.ENTITY_NAME, "Theatre");
    localStorage.setItem(USER_INFO.CLIENT_NAME, userInfo?.clientname);
    localStorage.setItem(USER_INFO.CLIENT_ID, userInfo?.clientId);
    localStorage.setItem(USER_INFO.IDENTIFIER,userInfo?.identifier);
    localStorage.setItem(USER_INFO.FIRST_NAME,userInfo?.firstName);
    localStorage.setItem(USER_INFO.LAST_NAME, userInfo?.lastName);
    localStorage.setItem(USER_INFO.CLIENT_GROUP_CODE, userInfo?.clientGroupCode);
    localStorage.setItem(USER_INFO.CLIENT_CODE, userInfo?.clientCode);
    localStorage.setItem(USER_INFO.ROLE_CODE, userInfo?.roleCode);
    localStorage.setItem(USER_INFO.ROLE_NAME, userInfo?.roleName);
    localStorage.setItem(USER_INFO.ENTITY_CODE, userInfo?.entityCode);
    localStorage.setItem(USER_INFO.SEAT_CODE, userInfo?.seatCode);
    localStorage.setItem(USER_INFO.PERMISSION_SET, JSON.stringify(userInfo?.permissionSet));
    sessionStorage.setItem(USER_INFO.REFRESH_TOKEN, userInfo?.refreshToken);
}
export function setClientLogo(clientLogo) {
    localStorage.setItem(USER_INFO.CLIENT_LOGO, clientLogo);
}

function getClientLogo() {
    return localStorage.getItem(USER_INFO.CLIENT_LOGO);
}

function getEntityName() {
    return localStorage.getItem(USER_INFO.ENTITY_NAME);
}

function getClientName() {
    return localStorage.getItem(USER_INFO.CLIENT_NAME);
}

function getClientId() {
    return localStorage.getItem(USER_INFO.CLIENT_ID);
}

function getUserRole() {
    return localStorage.getItem(USER_INFO.ROLE);
}

function getUserEmail() {
    return localStorage.getItem(USER_INFO.EMAIL)?.split("@")?.[0];
}
function getIdentifier() {
    return localStorage.getItem(USER_INFO.IDENTIFIER)
}

function getSeatCode() {
    return localStorage.getItem(USER_INFO.SEAT_CODE)
}

function getClientInfo() {
    const clientGroupCode = localStorage.getItem(USER_INFO.CLIENT_GROUP_CODE);
    const clientCode = localStorage.getItem(USER_INFO.CLIENT_CODE);
    const clientName = localStorage.getItem(USER_INFO.CLIENT_NAME);
    const clientId = localStorage.getItem(USER_INFO.CLIENT_ID);
    const entityCode = localStorage.getItem(USER_INFO.ENTITY_CODE);
    return {
        clientGroupCode,
        clientCode,
        clientName,
        clientId,
        entityCode
    };
}

function getUserRoleInfo() {
    const roleCode = localStorage.getItem(USER_INFO.ROLE_CODE);
    const roleName = localStorage.getItem(USER_INFO.ROLE_NAME);
    const firstName = localStorage.getItem(USER_INFO.FIRST_NAME);
    const lastName = localStorage.getItem(USER_INFO.LAST_NAME);
    return {
        roleCode,
        roleName,
        firstName,
        lastName
    };
}

export function getUserInfo() {
    return {
        role: getUserRole(),
        entity: getEntityName(),
        email: getUserEmail(),
        clientName: getClientName(),
        clientId: getClientId(),
        identifier: getIdentifier(),
        clientInfo: getClientInfo(),
        roleInfo: getUserRoleInfo(),
        seatCode: getSeatCode(),
        clientLogo: getClientLogo()
    }
}

export function resetUserInfo() {
    sessionStorage.removeItem(USER_INFO.ACCESS_TOKEN);
    localStorage.removeItem(USER_INFO.ROLE);
    localStorage.removeItem(USER_INFO.EMAIL);
    localStorage.removeItem(USER_INFO.ENTITY_NAME);
    localStorage.removeItem(USER_INFO.CLIENT_NAME);
    localStorage.removeItem(USER_INFO.CLIENT_ID);
    localStorage.removeItem(USER_INFO.IDENTIFIER);
    localStorage.removeItem(USER_INFO.FIRST_NAME);
    localStorage.removeItem(USER_INFO.LAST_NAME);
    localStorage.removeItem(USER_INFO.CLIENT_GROUP_CODE);
    localStorage.removeItem(USER_INFO.CLIENT_CODE);
    localStorage.removeItem(USER_INFO.ROLE_CODE);
    localStorage.removeItem(USER_INFO.ROLE_NAME);
    localStorage.removeItem(USER_INFO.PERMISSION_SET);
    localStorage.removeItem(USER_INFO.ENTITY_CODE);
    localStorage.removeItem(USER_INFO.SEAT_CODE);
    localStorage.removeItem(USER_INFO.CLIENT_LOGO);
    sessionStorage.removeItem(USER_INFO.REFRESH_TOKEN);
}
