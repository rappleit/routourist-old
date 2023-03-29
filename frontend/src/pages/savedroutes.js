import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { ariaHidden } from '@mui/material';
import {useState} from 'react'
import Link from 'next/link';

export function getStaticProps() {
    const userData =[{'email':'jason@gmail.com', 'password':'123','token':'2212','savedRoutes': [{'routeName':'Date Idea 1','request':{'origin':'Somapah 123 bukit','destination':'New Zealand 222','waypoints':['Somapah 123 bukit','Cafe Birdy Bukit 122','Rhoad Island Mall','SUTD'],'travelmode':'Drive','optimizeWaypoints':true}},{'routeName':'Date Idea 1','request':{'origin':'Somapah 123 bukit','destination':'New Zealand 222','waypoints':['Somapah 123 bukit','Cafe Birdy Bukit 122','Rhoad Island Mall','SUTD'],'travelmode':'Drive','optimizeWaypoints':true}}]}]
    const userSavedRoutes= userData[0]['savedRoutes']
    return {
        props:{routes:userSavedRoutes}
    }
} 

export default function SavedRoutes({routes}) {
    const [infoclicked,setinfoclicked]=useState(false)
    
    return(
        
        <div className="h-screen w-screen bg-eggshell">
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

            <div className=' h-fit grid grid-cols-3 gap-x-14 gap-y-5 mx-5 '>
                {routes.map(route => (
                    <div className='bg-green flex flex-col gap-y-1 text-center w-full rounded-md drop-shadow-lg'>
                        <h2 className='font-titleFont font-bold text-3xl mb-5 w-full h-full mt-5 '>{route.routeName}</h2>
                        <span className='font-bodyfont font-medium'><MyLocationIcon className='mr-3'/>{route.request.origin}</span>
                        <span><KeyboardArrowDownIcon/></span>
                        <span > <MoreHorizIcon/></span>
                        <span><KeyboardArrowDownIcon/></span>
                        <span className='font-bodyfont font-medium mb-3'>{route.request.destination}</span>
                    </div>
                ))}
                


                
            </div>
        </div>
    )
}