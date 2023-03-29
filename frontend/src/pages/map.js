import InfoIcon from '@mui/icons-material/Info';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TrendingFlatIcon from '@mui/icons-material/TrendingFlat';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft';
import Link from 'next/link';
import { useAuthContext } from '@/hooks/useAuthContext';
import { useLogout } from '@/hooks/useLogout';

export default function Map() {
    const { user } = useAuthContext()
    const { logout } = useLogout()

    const handleLogout = () => {
        logout()
      }

    return(
        <div className="bg-eggshell w-screen h-screen flex justify-between" >
            <div className="bg-gray z-10 h-screen w-1/4 place-self-start">
                <div className='mx-3 h-full flex flex-col '>
                    <div className='basis-1/12 flex items-baseline justify-between'> {/* title */}
                        <h1 className='font-titleFont font-bold text-eggshell text-2xl mt-4'>Routourist</h1>
                        <KeyboardDoubleArrowLeftIcon className='text-eggshell text-3xl cursor-pointer'/>
                    </div>

                    <form className='basis-7/12 mt-2 flex flex-col justify-evenly'>
                        <div className='font-bodyfont flex flex-col h-1/4 gap-2 overflow-auto'> {/* this is for the inputs */}
                            <div className='flex'>
                                <input placeholder='From where?' className='px-3 py-1 border-1 w-11/12 rounded-md'></input>
                                <MoreVertIcon className='text-eggshell text-3xl'/>
                            </div>
                            <div className='flex'>
                                <input placeholder='To where?' className='px-3 py-1 border-1 w-11/12 rounded-md'></input>
                                <MoreVertIcon className='text-eggshell text-3xl'/>
                            </div>
                            <div className='flex'>
                                <input placeholder='To where?' className='px-3 py-1 border-1 w-11/12 rounded-md'></input>
                                <MoreVertIcon className='text-eggshell text-3xl'/>
                            </div>
                            <div className='flex'>
                                <input placeholder='To where?' className='px-3 py-1 border-1 w-11/12 rounded-md'></input>
                                <MoreVertIcon className='text-eggshell text-3xl'/>
                            </div>
                            
                            
                        </div>

                        <div className='flex justify-center'> {/* this is for the add */}
                            <div>
                                <AddCircleOutlineIcon className='text-eggshell text-3xl cursor-pointer'/>
                            </div>
                            
                        </div>

                        <div className='font-bodyfont'>
                            <select name="ModeTransport" className='bg-gray text-eggshell w-11/12 font-bodyfont border-2 border-eggshell rounded-md px-3 py-1'>
                                <option value="Drive">Drive</option>
                                <option value="Transport">Transport</option>
                                <option value="Walk">Walk</option>
                                <option value="Cycling">Cycling</option>
                            </select>
                        </div>

                        <div> {/* checkbox */}
                            <input type="checkbox" name='OptimiseChoice'value="OptimiseChoice"></input>
                            <label for='OptimiseChoice' className='text-eggshell font-bodyfont ml-3'>Optimise Route</label>
                            <p className='text-eggshell font-bodyfont text-xs'>You can reduce your carbon footprint <br/> by optmising your route!</p>
                        </div>

                        <div className='flex place-content-center'> {/* buttons */}
                            <div>
                                <button className='font-bodyfont w-full max-h-fit bg-green py-2 px-3 rounded-lg drop-shadow-2xl mb-3'>Create Route</button>
                                <button className='font-bodyfont w-full max-h-fit bg-eggshell py-2 px-3 rounded-lg drop-shadow-2xl'>Save Route</button>
                            </div>
                            
                        </div>
                    </form>


                    <div className='h-full font-bodyfont basis-3/12 flex items-center '> {/* start to end section */}
                        <div className='h-fit'>
                            <h3 className='font-bold text-eggshell'>Optimised Route:</h3>
                            <div className='text-eggshell text-sm'>
                                from here <TrendingFlatIcon className='mx-1'/>to here
                            </div>
                            <p className='underline text-eggshell cursor-pointer text-sm'>Show Directions</p>
                        </div>
                        
                    </div>

                    <div className='basis-1/12 flex place-content-center'> {/* my saved routes button */}
                        <Link href={(user) ? "/map" : "/login"}><button className='font-bodyfont w-fit h-fit px-10 py-2.5  bg-eggshell rounded-lg drop-shadow-2xl'>My Saved Routes</button></Link> 
                    </div>

                </div>

            </div>

            


            <div className="flex flex-col justify-between my-4 mr-2">
                <div className='font-bodyfont'>
                    <button className='max-w-fit max-h-fit bg-gray rounded-xl text-eggshell py-1.5 px-4'>Show Nearby Attractions</button>
                    { (!user) ?
                        <Link href="/login"><button className='max-w-fit max-h-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1'/>Login</button></Link>:
                        <button onClick={()=> handleLogout()} className='max-w-fit max-h-fit bg-gray rounded-xl text-eggshell py-1.5 px-4 mx-3 hover:bg-green'><LogoutIcon className='mr-1'/>Logout</button>
                        }
                    <InfoIcon className='text-gray text-3xl mx-3'/>
                </div>
                <div className="bg-gray z-10 w-4/5 h-1/6 place-self-end rounded-md text-eggshell flex place-content-center items-center">
                    <div>
                        <h2 className='font-titleFont font-bold text-3xl'>Carbon Footprint</h2>
                        <h3 className='font-bodyfont text-2xl text-center'>420</h3>
                    </div>
                </div>
            </div>




        </div>


    )

}