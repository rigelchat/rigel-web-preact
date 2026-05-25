import { useState, useEffect } from "preact/hooks";
import { useSpring, animated } from "@react-spring/web";

import styles from "./LoginPage.module.css";
import { slideDownFadeIn } from "../utils/animations";
import SlideLayout from "../layouts/SlideLayout";
import InstanceSlide from "./LoginPage/InstanceSlide";
import LoginSlide from "./LoginPage/LoginSlide";
import { resetUserTheme } from "../utils/index.js";

export default function LoginPage() {
    const envConfigExists = import.meta.env.VITE_API_VERSION && import.meta.env.VITE_API_URL && import.meta.env.VITE_CDN_URL;
    const firstSlide = envConfigExists ? 1 : 0;
    const [instanceInfo, setInstanceInfo] = useState(envConfigExists ? {
        name: import.meta.env.VITE_INSTANCE_NAME,
        image: import.meta.env.VITE_INSTANCE_IMAGE,
        authMethods: {
            emailPassword: import.meta.env.VITE_INSTANCE_EMAIL_PASSWORD === "true",
            ...(import.meta.env.VITE_INSTANCE_DISCORD_CLIENT_ID && import.meta.env.VITE_INSTANCE_DISCORD_AUTH_URL) ? {
                discord: {
                    clientId: import.meta.env.VITE_INSTANCE_DISCORD_CLIENT_ID,
                    authUrl: import.meta.env.VITE_INSTANCE_DISCORD_AUTH_URL
                }
            } : {}
        }
    } : null);
    const [serverConfig, setServerConfig] = useState(envConfigExists ? {
        api: {
            baseUrl: import.meta.env.VITE_API_URL,
            apiVersions: {
                default: import.meta.env.VITE_API_VERSION
            }
        },
        cdn: {
            baseUrl: import.meta.env.VITE_CDN_URL
        }
    } : null);
    const [currentSlide, setCurrentSlide] = useState(firstSlide);

    const authBoxAnimation = useSpring(slideDownFadeIn);

    const handleInstanceVerified = (info, config) => {
        setInstanceInfo(info);
        setServerConfig(config);
        setCurrentSlide(1);
    };

    const showPreviousSlide = () => {
        setCurrentSlide(Math.max(currentSlide - 1, firstSlide));
    };

    useEffect(() => {
        resetUserTheme();

        const params = new URLSearchParams(window.location.search);
        const code = params.get("code");
        const error = params.get("error");
        const errorDescription = params.get("error_description");

        if (window.opener && (code || error || errorDescription)) {
            window.opener.postMessage({
                code,
                error,
                error_description: errorDescription
            }, window.location.origin);
        };
    }, []);

    return (
        <>
            <video src="/assets/videos/login-background.mp4" poster="/assets/videos/login-background.jpg" className={styles.artwork} autoPlay loop muted playsInline/>
            <img src="/assets/rigel-logo-white.svg" className={styles.logoWithText}/>
            <div className={styles.wrapper}>
                <animated.div className={styles.authBox} style={authBoxAnimation}>
                    <img src="/assets/rigel-logo-white.svg" className={styles.logo}/>
                    <SlideLayout currentSlide={currentSlide}>
                        {!envConfigExists && <InstanceSlide onInstanceVerified={handleInstanceVerified}/>}
                        <LoginSlide
                            instanceInfo={instanceInfo}
                            serverConfig={serverConfig}
                            envConfigExists={envConfigExists}
                            showPreviousSlide={showPreviousSlide}
                        />
                    </SlideLayout>
                </animated.div>
            </div>
        </>
    );
};