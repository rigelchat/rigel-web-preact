import { useState, useRef } from "preact/hooks";
import axios from "axios";

import styles from "../LoginPage.module.css";
import modalStyles from "./Modal.module.css";
import Button from "../../components/Button/Button";
import Input from "../../components/Input/Input";
import InputLabel from "../../components/Input/InputLabel";
import classNames from "classnames";

export default function InstanceCheckSlide({ onInstanceVerified }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const formRef = useRef(null);

    const handleSubmit = async (evt) => {
        evt.preventDefault();

        const formData = new FormData(evt.target);
        const url = formData.get("instanceUrl");
        if (!url || !url.trim()) return setError("URL invalide");

        setLoading(true);

        try {
            const cleanUrl = url.trim().replace(/\/$/, "");
            const { data: { instance: info } } = await axios(`${cleanUrl}/api/ping`);
            const { data: serverConfig } = await axios(`${cleanUrl}/.well-known/spacebar/client`);

            info.authMethods ??= {
                emailPassword: true
            };
            
            onInstanceVerified(info, serverConfig);
        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        };
    };

    return (
        <div className={classNames(styles.slideContent, modalStyles.modal)}>
            <div className={modalStyles.header}>
                <h1>Bienvenue sur Rigel</h1>
                <p>Entrez l'URL de votre instance pour commencer</p>
            </div>
            <form ref={formRef} className={classNames(modalStyles.content, styles.form)} onSubmit={handleSubmit}>
                <InputLabel htmlFor="instanceUrl" required={true} error={error}>URL de l'instance</InputLabel>
                <Input size="large" type="text" id="instanceUrl" name="instanceUrl"/>
            </form>
            <div className={modalStyles.footer}>
                <Button size="medium" submitting={loading} onClick={() => formRef.current?.requestSubmit()} style={{ marginLeft: "auto" }}>Vérifier</Button>
            </div>
        </div>
    );
}
