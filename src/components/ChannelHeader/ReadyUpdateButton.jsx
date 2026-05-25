import { useContext } from "preact/hooks";
import { PWAContext } from "../../contexts/PWAContext.jsx";

import * as Icons from "../../icons/Icons.jsx";

export default function ReadyUpdateButton() {
    const { needRefresh, updateServiceWorker } = useContext(PWAContext);

    if (!needRefresh) return null;

    return (
        <div className="button" title="Mise à jour prête !" onClick={() => updateServiceWorker(true)}>
            <Icons.Download style={{ color: "var(--green-330)" }}/>
        </div>
    );
};