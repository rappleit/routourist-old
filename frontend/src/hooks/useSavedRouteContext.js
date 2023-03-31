import { SavedRoutesContext } from "@/context/SavedRouteContext";
import { useContext } from "react";

export const useSavedRoutesContext = () => {
    const context = useContext(SavedRoutesContext)

    if(!context) {
        throw Error("useSavedRoutesContext must be used inside a savedRoutesContextProvider")
    }

    return context
}