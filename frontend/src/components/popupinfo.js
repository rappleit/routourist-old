import Modal from 'react-modal'
import React, { useRef } from 'react'
import {useEffect,useState} from 'react'
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuthContext } from '../hooks/useAuthContext'
import { useSavedRoutesContext } from '@/hooks/useSavedRouteContext';
import Link from 'next/link';
import GitHubButton from 'react-github-btn'


Modal.setAppElement("#__next");

const Popupinfo = ({closeinfo}) => {
    const handleClose = (e) => {
        e.preventDefault();
        closeinfo(false);
        console.log("modal closed")
    }
    return(
        <>   
            <div className='z-30 fixed h-screen w-screen flex place-content-center items-center'>
                <div className='fixed z-30 h-screen w-screen bg-gray opacity-50 '>

                </div>
                <div className=' fixed h-4/5 w-3/4 bg-eggshell z-30 flex flex-col gap-5 px-10 pb-10 rounded-md overflow-y-scroll'>
                    <div className='flex'>
                        <button onClick={(e) => handleClose(e)} className='mt-5 ml-5 text-xl'><CancelIcon/></button>
                        <h2 className='font-titleFont font-bold text-2xl w-full text-center mt-5'>Information</h2>
                    </div>

                    <div>
                        <h3 className='font-titleFont font-bold text-xl'>Input Destinations</h3>
                        <div className='font-bodyfont text-base'>
                            <p>Insert the location details and the autocomplete will assist in the process.</p>
                            <p>To ensure best experience include postal code.</p>
                            <p>To add more locations, click onto the addition button.</p>
                            <p>Pick mode of transport for the route inserted.</p>
                            <p>Tick the Optimise Route checkbox, to optimise the entire route. Shuffling, the locations
                                to give you the least amount of time taken to complete the route in that certain mode
                                of transport.
                            </p>
                            <p>Create Route to view the route.</p>
                        </div>
                        
                    </div>

                    <div>
                        <h3 className='font-titleFont font-bold text-xl'>Nearby Attraction</h3>
                        <p>Attractions are categorised, making it easier for you to decide what you recommendations
                            you want to see along the route.
                        </p>
                        <p>Simply tick which categories you wish to be recommended.</p>
                    </div>

                    <div>
                        <h3 className='font-titleFont font-bold text-xl'>Save Route</h3>
                        <p>To access feature, you must be <span className='font-bold'>logged in</span>.</p>
                        <p>You can save incomplete/complete routes inputted, and name them.</p>
                        <p>To retrieve, your saved routes, simply click the button &apos;My Saved Routes&apos;,
                        you will be able to access the information of the routes and use it again by clicking on it
                        </p>
                    </div>

                    <div>
                        <h3 className='font-titleFont font-bold text-xl'>About This Web App</h3>
                        <p>Routourist is created for the Google Solutions Challenge 2023 by students from the Singapore University of Technology and Design (SUTD) Google Developer Student Club (GDSC).<br/></p>
                        <p>You can find our Github Repository here:</p>
                        <GitHubButton href="https://github.com/rappleit/routourist">Check out our project!</GitHubButton>

                    </div>

                    
                </div>
            </div>
            
        </>
    )
}

export default Popupinfo
