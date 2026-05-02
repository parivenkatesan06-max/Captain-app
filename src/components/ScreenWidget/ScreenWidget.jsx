import React from "react";
import styles from "./ScreenWidget.module.scss";
import { ReactComponent as IconSVG } from "../../assets/Image/icons/screen-icon.svg";

const ScreenWidget = ({ screenNumber, onClick }) => {
    return (
        <button 
            className={styles.screenIconContainer}
            onClick={() => onClick(screenNumber)}
            aria-label={`${screenNumber}`}
        >
            <IconSVG className={styles.iconSVG} />
            <span className={styles.centeredText}>
                {screenNumber}
            </span>
        </button>
    );
};

export default ScreenWidget;
