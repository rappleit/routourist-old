import Head from 'next/head'
import Image from 'next/image'
import PlayArrowRoundedIcon from '@mui/icons-material/PlayArrowRounded';
import Link from 'next/link';


export default function Home() {
  return (
    <>

       <div className='bg-eggshell w-full h-full z-0' >
         <div className='w-screen h-screen'>
            <div className='grid grid-cols-6 grid-rows-4 w-screen h-screen'>

              <div className='col-start-1 col-end-7 row-start-1 row-end-2'>
                <h1 className='bg-gray text-eggshell py-5 px-5 font-titlefont font-black text-8xl laptop:text-7xl tablet:text-4xl'>Routourist</h1>
              </div>
              <div className='col-start-4 col-end-7 row-start-1 row-end-5 flex place-self-center'>
                  <img src='/directions.png' className='my-auto'></img>

              </div>
              
              <div className='col-start-1 col-end-4 row-start-2 row-end-3 ml-5 my-auto flex flex-col gap-5'>
                <h1 className='text-gray font-titlefont font-black text-7xl laptop:text-5xl tablet:text-2xl'>Navigating just got simpler.</h1>
                <p className='my-2 font-bodyfont text-base'>From one location to another to another and another</p>
              </div>
              <div className='col-start-1 col-end-4 row-start-3 row-end-5'>
                <div className='self-center '>
                  <Link href="/map"><button className='ml-5 font-medium font-bodyfont rounded-full w-fit px-8 py-3 bg-gray text-eggshell shadow-md  text-base hover:bg-green hover:text-eggshell'>Try Now!</button></Link>
                </div>
                
              </div>
                
              
            </div>
          </div>

          <div className='w-screen h-min-20 bg-green z-10'>
          
            <div className='flex mx-5 content-baseline'>
              
              <div className='basis-3/5 my-auto'>
                <p className='font-bodyfont font-medium text-base text-eggshell mb-10'>about us</p>
                <h2 className='font-titleFont font-bold text-7xl laptop:text-5xl tablet:text-2xl text-eggshell'>Got a date you need to plan for?</h2>
                <h2 className='font-titleFont font-bold text-7xl laptop:text-5xl tablet:text-2xl text-eggshell'>Perhaps you want to explore?</h2>
                <h2 className='font-titleFont font-bold text-7xl laptop:text-5xl tablet:text-2xl text-eggshell'>Maybe deliver some packages?</h2>
                <h2 className='font-titleFont font-black text-7xl laptop:text-5xl tablet:text-2xl text-eggshell'>We got you.</h2>
              </div>

              <div className='basis-2/5'>
                <img src='/carnavigate.png'></img>
              </div>
            </div>

            <div>
              <p className='ml-5 font-bodyfont font-medium text-xl laptop:text-base tablet:text-xs text-eggshell'>You can select a range of  popular presetted routes and customise 
however them you like and start.</p>
<p className='ml-5 font-bodyfont font-medium text-xl laptop:text-base tablet:text-xs text-eggshell pb-20'>Its as simple as that!</p>
            </div>
            
          </div>


          <div className='h-fit '>
            <div className='py-10 mx-5'>
              <p className='font-bodyfont font-medium text-base text-gray mb-10'>Our Goal</p>
              <h2 className='font-titleFont font-bold text-7xl laptop:text-5xl tablet:text-2xl text-gray'>Provide a convenient routing service that aims to be sustainable and promote other businesses</h2>
            </div>
            <div className='flex flex-wrap gap-5 grid-flow-row font-bodyfont text-center w-4/6 mx-auto place-content-center pb-10'>
              <div className='flex flex-col gap-1 basis-2/5 '>
                <img src='/calculate.png'></img>
                <p>Optimising routes to reduce carbon footprint</p>
              </div>

              <div className='flex flex-col gap-1 basis-2/5'>
                <img src='/website.png'></img>
                <p>Provide a user friendly experience</p>
              </div>
 
              <div className='flex flex-col gap-1 basis-2/5'>
                <img src='/environmenttruck.png'></img>
                <p>Recommends routes that emits lower carbon footprint </p>
              </div>

              <div className='flex flex-col gap-1 basis-2/5'>
                <img src='/notiff.png'></img>
                <p>Recommends nearby attractions according to user needs</p>
              </div>

            </div>
            

          </div>

          <div className='bg-green h-screen flex'>
            <div className='pt-10 mx-5 basis-1/2'>
              <p className='font-bodyfont font-medium text-base text-eggshell mb-10'>Action</p>
              <div className='flex flex-col h-3/4 '>
                <div className='basis-1/2 my-auto self-center'>
                  <h1 className='font-titleFont font-bold text-6xl laptop:text-4xl tablet:text-xl text-eggshell'>&quot;Going out feels less stressful&quot;</h1>
                  <h1 className='font-titleFont font-bold text-6xl laptop:text-4xl tablet:text-xl text-eggshell my-5'>&quot;Click here,Click there and Go&quot;</h1>
                  <h1 className='font-titleFont font-bold text-6xl laptop:text-4xl tablet:text-xl text-eggshell'>&quot;I didnt know I emitted that much carbon&quot;</h1>
                </div>
                <div className=' basis-1/2 mx-auto self-center'>
                <Link href="/map"><button className='bg-gray text-base w-fit py-2 px-6 rounded-xl text-eggshell hover:text-gray hover:bg-eggshell'>Try Now</button></Link>
                </div>
              </div>
            </div>

            <div className='basis-1/2'>
              <img src='/confident.png'></img>
            </div>
            
            
          </div>

          <div className='h-1/4 bg-gray'>
            <div className='ml-5 py-10'>
              <p className='font-bodyfont font-medium text-base text-eggshell my-5'>Socials</p>
              <div className=' '>
                <Link href='https://github.com/rappleit/routourist'><img src = 'Github_Logo_White.png' className='h-10 cursor-pointer'></img></Link>
              </div>
            </div>
            
          </div>

        </div>
          
        
    </>
  )
}
