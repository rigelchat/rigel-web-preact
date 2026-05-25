import { useState, useMemo, useCallback } from "preact/hooks";

export default function useUnsavedChanges(initialData, saveCallback) {
    const [data, setData] = useState(initialData);
    const [isSaving, setIsSaving] = useState(false);

    const initialDataJSON = JSON.stringify(initialData);
    const [prevInitialDataJSON, setPrevInitialDataJSON] = useState(initialDataJSON);

    if (initialDataJSON !== prevInitialDataJSON) {
        setData(initialData);
        setPrevInitialDataJSON(initialDataJSON);
    };

    const hasChanges = useMemo(() => {
        if (initialDataJSON !== prevInitialDataJSON) return false;
        return JSON.stringify(data) !== initialDataJSON;
    }, [data, initialDataJSON, prevInitialDataJSON]);

    const updateField = useCallback((field, value) => {
        setData((prev) => ({
            ...prev,
            [field]: value
        }));
    }, []);

    const reset = useCallback(() => {
        setData(initialData);
    }, [initialData]);

    const save = useCallback(async () => {
        if (!hasChanges || isSaving) return;

        setIsSaving(true);

        try {
            const changedFields = {};
            const initial = JSON.parse(initialDataJSON);

            Object.keys(data).forEach(key => {
                if (JSON.stringify(data[key]) !== JSON.stringify(initial[key])) {
                    changedFields[key] = data[key];
                };
            });

            await saveCallback(data, changedFields);
        } finally {
            setIsSaving(false);
        };
    }, [data, hasChanges, isSaving, saveCallback, initialDataJSON]);

    return {
        data,
        setData,
        updateField,
        hasChanges,
        reset,
        save,
        isSaving
    };
};