import Head from 'next/head'
import Image from 'next/image'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Link from 'next/link';


export default function Home() {
  return (
    <>

       <div className='bg-eggshell w-full h-full z-0' >
         <div className='w-screen h-screen'>
          <button className='rounded-full w-10 h-10 bg-green text-gray shadow-md mx-5'><PlayArrowRoundedIcon></PlayArrowRoundedIcon></button>
            <div className='grid grid-cols-8 grid-rows-2 gap-1 w-screen h-screen'>

              <div className='col-span-6 justify-self-auto self-center w-full row-span-1'>
                <div className='h-10'></div>
                <h1 className='ml-8 font-titlefont font-black laptop:text-7xl tablet:text-xl'>Navigating just got <span className='bg-green'>simpler.</span></h1>
              </div>
              <div className='col-span-2 justify-self-start self-center row-span-1'>
                <p>image example</p>
              </div>
              
              <div className='col-span-6 row-span-1'>
                <div className='ml-8'>examples</div>
              </div>
              <div className='col-span-2 row-span-1 justify-center'>
                <Link href="/map"><button className='font-medium font-bodyfont rounded-full w-40 py-4 bg-gray text-eggshell shadow-md self-center hover:bg-green hover:text-eggshell'>Try Now!</button></Link>
                
              </div>
            </div>
          </div>

          <div className='w-screen h-min-20 bg-green z-10'>
            <div className='flex gap-30 py-10 mx-5'>
              <div className='basis-3/4'>
                <p className='font-bodyfont font-medium text-base text-eggshell mb-10'>about us</p>
                <h2 className='font-titleFont font-bold text-5xl text-eggshell'>Got a date you need to plan for?</h2>
                <h2 className='font-titleFont font-bold text-5xl text-eggshell'>Perhaps you want to explore?</h2>
                <h2 className='font-titleFont font-bold text-5xl text-eggshell'>Maybe deliver some packages?</h2>
                <h2 className='font-titleFont font-black text-6xl text-eggshell'>We got you.</h2>
              </div>

              <div className='basis-1/4'>
                <p>image here</p>
              </div>
            </div>

            <div>
              <p className='ml-5 font-bodyfont font-medium text-xl text-eggshell'>You can select a range of  popular presetted routes and customise 
however them you like and start.</p>
<p className='ml-5 font-bodyfont font-medium text-xl text-eggshell pb-10'>Its as simple as that!</p>
            </div>
            
          </div>


          <div className='h-screen '>
            <div className='py-10 mx-5'>
              <p className='font-bodyfont font-medium text-base text-gray mb-10'>Our Goal</p>
              <h2 className='font-titleFont font-bold text-5xl text-gray'>Provide a convenient routing service that 
  aims to reduce user&apos;s carbon footprint</h2>
            </div>

            <div className='grid grid-cols-9 gap-40 mt-10'>
              <div className='flex-col col-start-3 col-end-5'>
                <div>image</div>
                <p>Optimising routes to reduce carbon footprint</p>
              </div>

              <div className='flex-col col-start-6 col-end-8'>
                <div>image</div>
                <p>Graphic Interface that shows users their impact</p>
              </div>

              <div className='flex-col col-start-4 col-end-6'>
                <div>image</div>
                <p>Recommends routes that emits lower carbon footprint </p>
              </div>

            </div>
            

          </div>

          <div>
            <div className='bg-green py-10'>
              <div className='my-10 mx-5'>
                <p className='font-bodyfont font-medium text-base text-eggshell mb-10'>Action</p>
                <h2 className='font-titleFont font-bold text-5xl text-eggshell'>Make an impact today</h2>
              </div>
              <div className='col-span-2 row-span-1 justify-center ml-5'>
                <button className='font-medium font-bodyfont rounded-full w-20 h-10 bg-gray text-eggshell shadow-md self-center hover:bg-eggshell hover:text-gray'>Login</button>
                <button className='font-medium font-bodyfont rounded-full w-20 h-10 bg-eggshell text-gray ml-4 shadow-md self-center hover:bg-gray hover:text-eggshell'>Sign Up</button>
              </div>
            </div>
          </div>

          <div className='h-screen'>
            <div className='ml-5 py-10'>
              <p className='font-bodyfont font-medium text-base text-gray mb-10'>Contact</p>
              <h2 className='font-titleFont font-bold text-5xl text-gray'>Tell us how to service you better</h2>
            </div>
            
          </div>

        </div>
          
        
    </>
  )
}
