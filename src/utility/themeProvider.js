import React, { createContext, useState, useEffect } from "react";
import doodle from "../assets/Image/doodle/Doodle.png"
import doodle3 from "../assets/Image/doodle/doodle3.png"
import doodle4 from "../assets/Image/doodle/doodle4.png"
import doodle5 from "../assets/Image/doodle/doodle5.png"
import doodle7 from "../assets/Image/doodle/doodle7.png"
import doodle8 from "../assets/Image/doodle/doodle8.png"

const doodleImages = [
    doodle,doodle3,doodle4,doodle5,doodle7,doodle8
];

const ThemeContext = createContext();

const themeColors = {
    lightOrange: {
        primary: "#D87500",
        secondary: "#e19c4b",
    },
    blue: {
        primary: "#3684E9",
        secondary: "#6BA6F0",
    },
    green: {
        primary: "#038828",
        secondary: "#5FB97F",
    },
    purple: {
        primary: "#9E57E1",
        secondary: "#BB80E2",
    },
    yellow: {
        primary: "#FFBD44",
        secondary: "#FFCC66",
    },
    red: {
        primary: "#E75E5C",
        secondary: "#F59C9A",
    },
}

const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(
        () => localStorage.getItem("theme") || "lightOrange"
    )
    const [doodle, setDoodle] =  useState(
        () => localStorage.getItem("doodle") || doodleImages[0]
    )

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme);
        localStorage.setItem("theme", theme);

        const selectedTheme = themeColors[theme];
        for (const [key, value] of Object.entries(selectedTheme)) {
            document.documentElement.style.setProperty(`--${key}-color`, value);
        }
    }, [theme]);

    useEffect(()=>{
        localStorage.setItem("doodle", doodle);
        document.documentElement.style.setProperty(
            "--captain-bg-image",
            `url(${doodle})`
        )
    },[doodle])

    return (
        <ThemeContext.Provider
            value={{
                themeColors: themeColors[theme],
                theme,
                setTheme,
                doodleImages,
                setDoodle,
                doodle
            }}
        >
            {children}
        </ThemeContext.Provider>
    )
}

export { ThemeProvider, ThemeContext }
