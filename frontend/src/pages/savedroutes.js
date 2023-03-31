import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ariaHidden } from '@mui/material';
import {useEffect, useState} from 'react'
import Link from 'next/link';
import { useSavedRoutesContext } from '@/hooks/useSavedRouteContext';
import { useAuthContext } from '@/hooks/useAuthContext';


export default function SavedRoutes() {

    const {savedRoutes, dispatch} = useSavedRoutesContext()
    const {user} = useAuthContext()

    useEffect(() => {
        const fetchSavedRoutes = async () => {
            const response = await fetch("http://localhost:8000/api/savedRoutes/", {
                headers: {'Authorization': `Bearer ${user.token}`}
            })
            const json = await response.json()
            if (!response.ok) {
                console.error(json.error)
            }
            if (response.ok) {
                dispatch({type: "SET_SAVEDROUTES", payload: json})
            }
        }
        
        if (user) {
            fetchSavedRoutes()
        }
    }, [dispatch, user])

    const viewRoute = (e, routeName, routeOverview, route) => {
        e.preventDefault()
        localStorage.setItem("routeName", routeName)
        localStorage.setItem("routeOverview", routeOverview)
        localStorage.setItem("route", routePath)
    }

    
    return(
        
        <div className="w-full h-screen bg-eggshell">
            <div className='flex justify-between mx-5 bg-eggshell'>
                <div className='text-gray font-bodyfont font-medium text-md mt-4'> 
                    <Link href='/map'><span><ArrowBackIosIcon className='text-3xl'/>Back to Map</span></Link>
                </div>

                <div className='mt-4'>
                    <InfoIcon className='text-3xl mr-3'/>
                    <span className='w-fit px-2 py-2 bg-gray text-eggshell rounded-md'><LogoutIcon/>Login/Logout</span>
                </div>
                
            </div> 


            <h1 className='font-titleFont font-bold text-5xl ml-5 my-4'>Saved Routes</h1>

            <div className='grid grid-cols-3 md:grid-cols-4 gap-y-5 gap-x-8 mx-12 mt-12 pb-24 auto-rows-fr'>
                {
                    savedRoutes && savedRoutes.map((sr) => (
                        <div className="h-full bg-green text-center rounded-md p-5 flex flex-col justify-between" key={sr._id}>
                            <div>
                                <h1 className="text-lg font-medium">{sr.name}</h1>
                                <p className="my-2 italic">{sr.overview}</p>
                            </div>
                            <button className="bg-white rounded-md w-full p-2 my-2 hover:bg-slate-200 font-medium">View Route</button>
                        </div>
                    ))
                }
                
            </div>
        </div>
    )
}