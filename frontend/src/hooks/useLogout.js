import { useAuthContext } from "./useAuthContext"
import { useSavedRoutesContext } from "./useSavedRouteContext"

export const useLogout = () => {
    const {dispatch} = useAuthContext()
    const {dispatch: dispatchSavedRoutes} = useSavedRoutesContext()
    const logout = () => {
        //remove user from local storage
        localStorage.removeItem("user")

        //dispatch logout action
        dispatch({type: "LOGOUT"})
        dispatchSavedRoutes({ type: 'SET_SAVEDROUTES', payload: [] })




    }
    return {logout}
}