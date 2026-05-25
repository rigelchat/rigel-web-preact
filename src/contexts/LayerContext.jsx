import { createContext } from "preact";
import { useState, useCallback } from "preact/hooks";

export const LayerContext = createContext();

export function LayerProvider({ children }) {
    const [layers, setLayers] = useState([]);

    const openLayer = useCallback((layerName, props = {}) => {
        setLayers((prev) => [...prev, { name: layerName, props }]);
    }, []);

    const closeLayer = useCallback(() => {
        setLayers((prev) => prev.slice(0, -1));
    }, []);

    const closeAllLayers = useCallback(() => {
        setLayers([]);
    }, []);

    return (
        <LayerContext.Provider value={{ layers, openLayer, closeLayer, closeAllLayers }}>
            {children}
        </LayerContext.Provider>
    );
};