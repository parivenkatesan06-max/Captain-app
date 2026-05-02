import React from "react";
import styles from "./ErrorPage.module.scss";
import { Layout } from "antd";
import oopsImage from "../../assets/Image/icons/sww-orange.svg";

const ErrorPage = () => {

    const errorMessage = "Oops ...";
    const description = "Something Went Wrong";
    const errorDescription = "Something went wrong on our end. Please try again later."
    return (
        <Layout className="layoutWrapper">
            <div className={styles.errorContainer}>
                <div className={styles.errorContent}>
                    <div className={styles.imageContainer}>
                        <img src={oopsImage} alt="oopsImage" className={styles.imageBanner} />;
                    </div>
                    <h2 className={styles.errorMessage}>{errorMessage}</h2>
                    <p className={styles.description}>{description}</p>
                    <p className={styles.errorDescription}>{errorDescription}</p>
                </div>
            </div>
        </Layout>
    )
};

export default ErrorPage;