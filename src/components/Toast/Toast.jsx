import React, { useEffect } from "react";
import styles from "./Toast.module.scss";

const Toast = ({ message, visible, duration = 3000, onClose }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                if (onClose) onClose();
            }, duration);
            return () => clearTimeout(timer);
        }
    }, [visible, duration, onClose]);

    return visible ? (
        <div className={styles.toastOverlay}>
            <div className={styles.toastMessage}>
                {message}
            </div>
        </div>
    ) : null;
};


export default Toast;
