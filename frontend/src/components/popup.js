import Modal from 'react-modal'
import React, { useRef } from 'react'
import {useEffect,useState} from 'react'
import CancelIcon from '@mui/icons-material/Cancel';
import { useAuthContext } from '../hooks/useAuthContext'
import { useSavedRoutesContext } from '@/hooks/useSavedRouteContext';
import Link from 'next/link';

Modal.setAppElement("#__next");

const Popup = ({closemodal, overview, route}) => {
    const { dispatch } = useSavedRoutesContext()
    const [isLogin, setIsLogin] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const { user } = useAuthContext()
    const [isRouteSaved, setIsRouteSaved] = useState(false)

    const routeNameInputRef = useRef()

    const handleSubmit= async (e) => {
        e.preventDefault()
        
        const name = routeNameInputRef.current.value
        if (name !== "") {
           const routeToSave = {name, overview, route};
           console.log(routeToSave)
           const response = await fetch('http://localhost:8000/api/savedRoutes', {
            method: 'POST',
            body: JSON.stringify(routeToSave),
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${user.token}`
            }
          })
          const json = await response.json()
      
          if (!response.ok) {
            console.error(json.error)
          }
          if (response.ok) {
            dispatch({type: 'CREATE_SAVEDROUTE', payload: json})
            setIsRouteSaved(true)
          }
        }
    }

    const handleClose = (e) => {
        e.preventDefault();
        setIsRouteSaved(false);
        closemodal(false);
        console.log("modal closed")
    }
    
    
    useEffect(() => {
        if (user){
            setIsLogin(true)
        }
        if (route.origin) {
          setIsValid(true);
        }
      }, []);
    
      if (isLogin && isValid && !isRouteSaved){
        return(
            <>
                <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                    <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                        
                    </div>
                    <div className='z-30 opacity-100 w-1/3 h-1/3 bg-eggshell rounded-md self-center pr-5'>
                        <CancelIcon className='text-3xl m-2 cursor-pointer' onClick={(e) => handleClose(e)
                                }/>
    
                        
                        <div className='flex flex-col gap-2 content-center'>
                            
                            <div className='ml-5 mt-5'>
                                <p className='font-titleFont font-bold text-md'>From: {route.origin}</p>
                                <p className='font-titleFont font-bold text-md'>Final Destination: {route.destination}</p>
                            </div>
                            <form className='ml-5 mt-10' onSubmit={handleSubmit}>
                                <input ref={routeNameInputRef} placeholder='Please name your route' className='w-3/4 py-1 px-1'></input>
                                <button className='bg-green drop-shadow-xl font-bodyfont rounded-md py-0.5 px-2 ml-5'>Save</button>
                            </form>
                        </div>
                    </div>
                </div>
                </>
      );}

      if (!isLogin){
        return(
            <>
            <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                    
                </div>
                <div className='z-30 opacity-100 w-1/3 h-1/3 bg-eggshell rounded-md self-center'>
                    <div>
                        <CancelIcon className='m-5 cursor-pointer text-3xl' onClick={(e) => handleClose(e)
                        }/>
                        <h1 className='text-center font-bold text-xl'>Please Login</h1>
                        
                    </div>
                </div>
            </div>
            </>
        )
      }

    if (!isValid) return(
        <>
            <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                    
                </div>
                <div className='z-30 opacity-100 w-1/3 h-1/3 bg-eggshell rounded-md self-center'>
                    <div>
                        <CancelIcon className='m-5 cursor-pointer text-3xl' onClick={(e) => handleClose(e)}/>
                        <h1 className='ml-5 text-xl m-4 font-bold text-center'>Please create a route first</h1>
                        
                    </div>
                </div>
            </div>
        </>
    )
    if (isRouteSaved) return (
        <>
            <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                    
                </div>
                <div className='z-30 opacity-100 w-1/3 bg-eggshell rounded-md self-center pb-8'>
                    <div>
                        <CancelIcon className='m-4 cursor-pointer text-3xl' onClick={(e) => handleClose(e)}/>
                        <div className="w-full h-full flex flex-col justify-center items-center">
                            <h1 className='ml-5 text-lg m-4 font-medium text-center'>Your route has been saved</h1>
                            <button onClick={(e) => handleClose(e)} className="px-4 py-2 bg-green text-eggshell rounded-lg hover:bg-lightgreen"><Link href="/savedroutes">See My Saved Routes</Link></button>
                        </div>
                        
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default Popup
