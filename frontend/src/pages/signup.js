import Link from "next/link"
import { useState } from "react"
import { useSignup } from "@/hooks/useSignup"

export default function Signup() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const {signup, error, isLoading} = useSignup()

    const handleSubmit = async (e) => {
        e.preventDefault()

        await signup(email, password)
    }


    return (
        <div className="signupPage bg-eggshell w-full h-full">
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="signupCard bg-white p-10 w-2/5 rounded-lg flex flex-col items-center">
                    <h2 className="text-center font-bold text-2xl">Create Account</h2>
                    <form className="signupForm w-full m-6" onSubmit={handleSubmit}>
                        <div className="flex flex-col">
                            <label className=" font-medium">Email</label>
                            <input
                                type="email"
                                placeholder="Please enter your email"
                                onChange={(e) => setEmail(e.target.value)}
                                className="border w-full p-2 rounded-md mt-2 mb-6"
                            />
                        </div>
                        <div className="flex flex-col">
                            <label className=" font-medium">Password</label>
                            <input
                                type="password"
                                placeholder="Please enter your password"
                                onChange={(e) => setPassword(e.target.value)}
                                className="border w-full p-2 rounded-md mb-6"
                            />
                        </div>
                        <button disabled={isLoading} className="p-2 bg-green hover:bg-lightgreen text-white w-full rounded-md font-medium">{isLoading ? "Please Wait" : "Sign Up"}</button>
                        {error && <p className="text-red-500 font-medium text-center mt-4">{error}</p>}
                    </form>
                    <p className="text-center">Already have an account? <Link href="/login" className="text-darkgreen underline">Login here</Link></p>
                    <Link href="/map" className="text-darkgreen underline my-6">Go to Map</Link>

                </div>

            </div>

        </div>

    )
}

