import React, { useEffect, useMemo, useState } from "react"
import { Routes, Route, useNavigate, useLocation } from "react-router-dom"
import "./styles/index.scss"
import SideNavBar from "./components/SideNavBar/SideNavBar"
import LoginComponent from "./pages/LoginPage/LoginPage"
import MenuPage from "./pages/MenuPage"
import TablePage from "./pages/TablePage"
import QRPage from "./pages/QRPage"
import RolePage from "./pages/RolePage"
import InventoryPage from "./pages/InventoryPage"
import OrderDetailsPage from "./pages/OrderDetailsPage/OrderDetailsPage"
import ScreensPage from "./pages/ScreensPage/ScreensPage"
import ScreensOrderInfo from "./pages/ScreensOrderInfoPage/ScreensOrderInfo"
import SettingsPage from "./pages/SettingsPage/SettingsPage"
import ReportsPage from "./pages/ReportsPage/ReportsPage"
import CreateNewUser from "./pages/CreateUserPage/CreateUserPage"
import UserListPage from "./pages/UserListPage/UserListPage"
import { ROLES, ENTITY, ROLE_NAME } from "./utility/constants"
import { getUserInfo } from "./utility/userInfo"
import BottomNavBar from "./components/ConsumerViewComponents/BottomNavBar/BottomNavBar"
import MobileHomeScreen from "./pages/ConsumerPages/MobileHomeScreen/MobileHomeScreen"
import MobileMenuScreen from "./pages/ConsumerPages/MobileMenuScreen/MobileMenuScreen"
import MobileCartScreen from "./pages/ConsumerPages/MobileCartScreen/MobileCartScreen"
import MobileOrdersScreen from "./pages/ConsumerPages/MobileOrdersScreen/MobileOrdersScreen"
import MobileOffersScreen from "./pages/ConsumerPages/MobileOffersScreen/MobileOffersScreen"
import { CartProvider } from "./utility/CartUtils"
import QRList from "./pages/QRPage/QRList"
import EditUserPage from "./pages/EditUserPage/EditUserPage"
import DeleteUserPage from "./pages/DeleteUserPage/DeleteUserPage"
import AddMenuScreen from "./pages/MenuPage/Components/AddMenuScreen/AddMenuScreen"
import { ThemeProvider } from "./utility/themeProvider"
import { checkRoutePermission } from "./utility/permissionUtils"
import OrderHistory from "./pages/OrderHistory/OrderHistory"
import ForgotPassword from "./pages/ForgotPassword/ForgotPassword"
import EmailResetPassword from "./pages/EmailResetPassword/EmailResetPassword"
import ResetTempPassword from "./pages/ResetTempPassword/ResetTempPassword"

const ProtectedRoute = ({ permissionSet, path, children }) => {
    const hasAccess = checkRoutePermission(path, permissionSet);
    return hasAccess ? children : <MenuPage />;
};

// Consumer Routes
const ConsumerRoutes = () => (
    <Routes>
        <Route path="/consumer/homescreen" element={<MobileHomeScreen />} />
        <Route path="/consumer/menuscreen" element={<MobileMenuScreen />} />
        <Route path="/consumer/cartscreen" element={<MobileCartScreen />} />
        <Route path="/consumer/ordersscreen" element={<MobileOrdersScreen />} />
        <Route path="/consumer/offersscreen" element={<MobileOffersScreen />} />
    </Routes>
);

// Admin Routes
const AdminRoutes = ({ userPermission,location }) => (
    <Routes>
        <Route path="/" element={<MenuPage />}>
            <Route
                path=":menuAction"
                element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><AddMenuScreen /></ProtectedRoute>}            />
        </Route>
        <Route path="/table" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><TablePage /></ProtectedRoute>} />
        <Route path="/qr" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><QRPage /></ProtectedRoute>}>
            <Route path=":qrAction" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><QRList /></ProtectedRoute>} />
        </Route>
        <Route path="/role" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><RolePage /></ProtectedRoute>} />
        <Route path="/screens" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><ScreensPage /></ProtectedRoute>} />
        <Route path="/screens/screens-info" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><ScreensOrderInfo /></ProtectedRoute>} />
        <Route path="/table/:tableId/order-details" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><OrderDetailsPage /></ProtectedRoute>} />
        <Route path="/inventory" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><InventoryPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><SettingsPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><ReportsPage /></ProtectedRoute>} />
        <Route path="/role/create-new-user" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><CreateNewUser /></ProtectedRoute>} />
        <Route path="/role/edit-user" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><EditUserPage /></ProtectedRoute>} />
        <Route path="/role/delete-user" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><DeleteUserPage /></ProtectedRoute>} />
        <Route path="/role/user-list" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><UserListPage /></ProtectedRoute>} />
        <Route path="/order-history" element={<ProtectedRoute permissionSet={userPermission} path={location.pathname}><OrderHistory /></ProtectedRoute>} />
        <Route path="/login" element={<LoginComponent />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/email-reset-password" element={<EmailResetPassword/>} />
        <Route path="/reset-temporary-password" element={<ResetTempPassword/>} />
    </Routes>
);

function App() {
    const navigate = useNavigate()
    const location = useLocation()
    const getInitialPermissions = () => {
        const storedPermissions = localStorage.getItem("permissionSet");
        if (!storedPermissions || storedPermissions === "undefined") {
            return [];
        }
        try {
            return JSON.parse(storedPermissions);
        } catch (error) {
            console.error("Failed to parse permissionSet from localStorage:", error);
            return [];
        }
    };

    const [userPermission, setUserPermission] = useState(getInitialPermissions());
    const userInfo = getUserInfo();
    const isCaptainView = useMemo(() => {
        return (
            userInfo?.entity === ENTITY.HOTEL &&
            userInfo?.role === ROLES.CAPTAIN
        )
    }, [userInfo])

    const isLogin = useMemo(() => {
        return (
            location.pathname === "/login" 
        )
    }, [location.pathname])
    const isForgotPassword = useMemo(() => {
        return (
            location.pathname === "/forgot-password" || location.pathname === "/email-reset-password" || location.pathname === "/reset-temporary-password"
        )
    }, [location.pathname])

    const isConsumerRoute = useMemo(() => {
        return location.pathname.includes("/consumer")
    }, [location.pathname])

    // Function to handle the unprotected route redirection
    const handleUnprotectedRoute = () => {
        navigate("/login")
    }

    // Function to handle login redirection
    const handleLoginRedirect = () => {
        if (userInfo?.roleInfo?.roleName === ROLE_NAME.CLIENT_ADMIN) {
            navigate("/")
        } else {
            navigate("/role")
        }
    }

    const handleForgotPasswordRedirect = () => {
        if(location.pathname === "/forgot-password") {
            navigate("/forgot-password")
        } else if(location.pathname.includes("/email-reset-password")){
            navigate("/email-reset-password")
        } else if(location.pathname === "/reset-temporary-password"){
            navigate("/reset-temporary-password")
        }
    }


    // Function to handle captain view redirection
    const handleCaptainViewRedirect = () => {
        if (!location.pathname.includes("/order-details")) {
            navigate("/table")
        }
    }

    const tokenCheck =()=>{
        const token = sessionStorage.getItem("accessToken")
        return !token || token === "undefined"
    
    }
    const getPermissionset = () => {
        const permissions = JSON.parse(localStorage.getItem("permissionSet"));
        if (permissions) {
            setUserPermission(permissions);
        }
    }
    // eslint-disable-next-line complexity
    useEffect(() => {
        if(isConsumerRoute){
            return
        }
        if (tokenCheck() && !isForgotPassword) {
            handleUnprotectedRoute()
            return
        }
        if (tokenCheck() && isLogin) {
            handleLoginRedirect() 
            return
        }
        if (tokenCheck() && isForgotPassword) {
            handleForgotPasswordRedirect() 
            return
        }
        if (isCaptainView && tokenCheck()) {
            handleCaptainViewRedirect()
        }
    }, [
        location.pathname
    ])

    useEffect(() => {
        if (!tokenCheck()) {
            if (userPermission.length === 0) {
                getPermissionset();
                return;
            }
        }
    }, [location.pathname, userPermission]);
    const hideSideNavBar = useMemo(() => {
        const authPaths = [
            "/login",
            "/forgot-password",
            "/email-reset-password",
            "/reset-temporary-password"
        ];
        
        return authPaths.includes(location.pathname) || 
               isCaptainView || 
               isConsumerRoute;
    }, [location.pathname, isCaptainView, isConsumerRoute]);

    const showBottomNavBar = useMemo(() => {
        return isConsumerRoute
    }, [isConsumerRoute])

    const ConsumerWrapper = ({ children }) => {
        return <div className="consumer-background">{children}</div>
    }

    return (
        <ThemeProvider>
            <CartProvider>
                {!hideSideNavBar && <SideNavBar permissions={userPermission} />}
                {isConsumerRoute ? (
                    <ConsumerWrapper>
                        <ConsumerRoutes />
                        {showBottomNavBar && <BottomNavBar />}
                    </ConsumerWrapper>
                ) : (
                    <>
                        <AdminRoutes
                            userPermission={userPermission}
                            location={location}
                            userInfo={userInfo}
                        />
                        {userInfo?.roleInfo?.roleName ===
                            ROLE_NAME.CLIENT_ADMIN && (
                            <Routes>
                                <Route path="/counter/menuscreen" element={<MobileMenuScreen />} />
                                <Route path="/counter/cartscreen" element={<MobileCartScreen />} />
                                <Route path="/counter/ordersscreen" element={<MobileOrdersScreen />} />
                                <Route path="/counter/offersscreen" element={<MobileOffersScreen />} />
                            </Routes>
                        )}
                        {<BottomNavBar />}
                    </>
                )}
            </CartProvider>
        </ThemeProvider>
    )
}

export default App