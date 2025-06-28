import React from 'react'
import ModelViewer from '@/components/ModelViewer'

const index = () => {
    return (
        <div className='bg-[#161616] text-white flex flex-col items-center justify-center min-h-screen px-4'>
            <div className="mt-10 w-full h-[50vh] md:h-screen">
                <ModelViewer />
            </div>

            <div className="text-3xl md:text-5xl text-center text-amber-200 mt-6 md:mt-12">
                Timer Pomodoro Choose your minutes
            </div>

            <div className="tabs flex flex-col md:flex-row justify-center mt-6 gap-4 w-full items-center">
                <a className="tab border px-5 py-3 rounded-xl text-md border-amber-200 tab-bordered w-40 text-center">5 minutes</a>
                <a className="tab border px-5 py-3 rounded-xl text-md border-amber-200 tab-bordered w-40 text-center">10 minutes</a>
                <a className="tab border px-5 py-3 rounded-xl text-md border-amber-200 tab-bordered w-40 text-center">25 minutes</a>
            </div>

            <div className="times w-full mt-10">
                <div className="flex flex-col sm:flex-row justify-center items-center text-center gap-6">
                    <div className="flex flex-col items-center">
                        <span className="text-6xl md:text-9xl text-amber-200">00</span>
                        <span className="text-gray-400 text-sm">Minutes</span>
                    </div>
                    <div className="text-6xl md:text-9xl text-gray-400">:</div>
                    <div className="flex flex-col items-center">
                        <span className="text-6xl md:text-9xl text-amber-200">00</span>
                        <span className="text-gray-400 text-sm">Seconds</span>
                    </div>
                </div>
            </div>

            <div className="flex justify-center mt-10 w-full">
                <button className="border border-amber-200 text-amber-200 px-6 py-3 rounded-xl text-lg font-semibold hover:text-white hover:bg-amber-300 transition duration-300">
                    Start Timer
                </button>
            </div>
        </div>
    )
}

export default index
