import Link from "next/link"
import { useState } from "react"

export default function Login() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    const handleSubmit= async (e) => {
        e.preventDefault()

        console.log(email, password)
    }
    return (
        <div className="loginPage bg-eggshell w-full h-full">
            <div className="w-screen h-screen flex justify-center items-center">
                <div className="loginCard bg-white p-10 w-2/5 rounded-lg flex flex-col items-center">
                    <h2 className="text-center font-bold text-2xl">Login</h2>
                    <form className="loginForm w-full m-6" onSubmit={handleSubmit}>
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
                        <button className="p-2 bg-green hover:bg-lightgreen text-white w-full rounded-md font-medium">Login</button>
                    </form>

                    <p>Don't have an account? <Link href="/signup" className="text-darkgreen underline">Sign up here</Link></p>
                </div>

            </div>

        </div>

    )
}

