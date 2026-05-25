import { render } from "preact";
import { Switch, Route } from "wouter-preact";
import { RouteProvider } from "./contexts/RouteContext";
import { AppBadgeProvider } from "./contexts/AppBadgeContext";
import { StorageProvider } from "./contexts/StorageContext";
import { LayerProvider } from "./contexts/LayerContext";
import { PWAProvider } from "./contexts/PWAContext";

import "./styles/main.css";
import "./styles/colors.css";
import "./styles/themes.css";
import "./styles/custom-theme-backgrounds.css";
import "./styles/scrollbars.css";

import AppPage from "./pages/AppPage";
import LoginPage from "./pages/LoginPage";

render(
    <RouteProvider>
        <StorageProvider>
            <AppBadgeProvider>
                <LayerProvider>
                    <PWAProvider>
                        <Switch>
                            <Route path="/login" component={LoginPage}/>
                            <Route component={AppPage}/>
                        </Switch>
                    </PWAProvider>
                </LayerProvider>
            </AppBadgeProvider>
        </StorageProvider>
    </RouteProvider>,
    document.getElementById("app")
);