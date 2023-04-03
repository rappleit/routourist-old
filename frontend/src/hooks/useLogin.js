import { useRouter } from "next/router";
import { useState } from "react";
import { useAuthContext } from "./useAuthContext";

export const useLogin = () => {
    const [error, setError] = useState(null)
    const [isLoading, setIsLoading] = useState(null)
    const { dispatch } = useAuthContext()

    const router = useRouter()

    const login = async (email, password) => {
        setIsLoading(true)
        setError(null)
        
        const response = await fetch(`${process.env.NEXT_PUBLIC_QUERY_URL}/api/user/login`, {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({email, password})
        })
        const json =  await response.json()

        if (!response.ok) {
            setIsLoading(false)
            setError(json.error)
        } else if (response.ok) {
            //save user to local storage
            localStorage.setItem("user", JSON.stringify(json))

            //update auth context
            dispatch({type: "LOGIN", payload: json})
            
            setIsLoading(false)
            router.push("/map")
        }
    }

return { login, isLoading, error }
   
}