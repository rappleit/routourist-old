import Modal from 'react-modal'
import React from 'react'
import {useEffect,useState} from 'react'
import CancelIcon from '@mui/icons-material/Cancel';
import saveroute from '../hooks/useSaveRoute';
import { useAuthContext } from '../hooks/useAuthContext'

Modal.setAppElement("#__next");

const Popup = ({closemodal,route}) => {
    const [isLogin, setIsLogin] = useState(false)
    const [isValid, setIsValid] = useState(false)
    const [savedRoutes,setSavedRoutes] = useState(null)
    const { user } = useAuthContext()

    const handleSubmit= async (e) => {
        e.preventDefault()
        
        console.log(user)
        await saveroute(user,savedRoutes)
    }
    
    useEffect(() => {
        if (user){
            setIsLogin(true)
        }
        if (route['request']['origin'] !== '') {
          console.log(route['request']['origin'])
          setIsValid(true);
        }
      }, []);
    
      if (isLogin && isValid){
        return(
            <>
                <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                    <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                        
                    </div>
                    <div className='z-30 opacity-100 w-1/3 h-1/2 bg-eggshell rounded-md self-center'>
                        <CancelIcon className='text-3xl m-2 cursor-pointer' onClick={()=>
                                    closemodal(false)
                                }/>
    
                        
                        <div className='flex flex-col gap-2 content-center'>
                            
                            <div className='ml-5 mt-5'>
                                <p>From: {route['request']['origin']}</p>
                                <p>Final Destination: {route['request']['destination']}</p>
                            </div>
                            <form className='ml-5 mt-10' onSubmit={handleSubmit}>
                                <input placeholder='Route Name' className='w-3/4 py-1 px-1'></input>
                                <button className='bg-green drop-shadow-xl rounded-md py-0.5 px-2 ml-5'>Save</button>
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
                <div className='z-30 opacity-100 w-1/3 h-1/2 bg-eggshell rounded-md self-center'>
                    <div>
                        <CancelIcon className='m-5 cursor-pointer text-3xl' onClick={()=>
                            closemodal(false)
                        }/>
                        <h1 className='ml-5'>Please Login</h1>
                        
                    </div>
                </div>
            </div>
            </>
        )
      }

    return(
        <>
            <div className='z-30 fixed h-screen w-screen flex place-content-center'>
                <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>
                    
                </div>
                <div className='z-30 opacity-100 w-1/3 h-1/2 bg-eggshell rounded-md self-center'>
                    <div>
                        <CancelIcon className='m-5 cursor-pointer text-3xl' onClick={()=>
                            closemodal(false)
                        }/>
                        <h1 className='ml-5'>Please insert the locations</h1>
                        
                    </div>
                </div>
            </div>
        </>
    )
}

export default Popup
