import CancelIcon from '@mui/icons-material/Cancel';


const DirectionsPopup = ({
    closemodal,
    isOpen
}) => {
    return (
        <div className={`${isOpen ? "" : "hidden"} z-30 fixed h-screen w-screen flex place-content-center`}>
            <div className='z-10 h-full w-screen fixed bg-gray opacity-50'>

            </div>
            <div className='z-30 opacity-100 h-96 overflow-y-scroll bg-eggshell rounded-md self-center pb-8'>
                <div>
                    <CancelIcon className='m-4 cursor-pointer text-3xl' onClick={(e) => closemodal(false)} />
                    <div className="w-full h-full flex flex-col justify-center items-center">
                        <div id="directionsPanel" className="py-4 px-10"></div>
                    </div>


                </div>
            </div>
        </div>
    );
}

export default DirectionsPopup;