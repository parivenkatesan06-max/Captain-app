import React from "react"
import { Spin } from "antd"
import Lottie from "lottie-react";
import LoaderLottieJson from "../../assets/Lottie/loader-lottie.json"

function LoaderLottie() {
    return (
        <Spin
            className="spinWrapper"
            indicator={<Lottie animationData={LoaderLottieJson} loop={true}/>}
            fullscreen
        />
    )
}

export default LoaderLottie;
