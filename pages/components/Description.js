import React from 'react'
import Image from 'next/image'

export default function Description() {
    return (
        <div className='relative flex justify-center my-50 bg-white py-22 overflow-hidden'>
            <Image
                src="/images/background.png"
                alt="Background"
                fill
                className="object-cover opacity-15"
                unoptimized
            />
            <p className='relative z-10 text-[7.5vw] uppercase text-center max-w-[66vw] leading-none bg-gradient-to-r from-[#0a6448] via-[#0f2755] to-[#0a6448] bg-clip-text text-transparent font-bold'>
                Prácticas Profesionales Más Oportunidades Más Universidad            </p>
        </div>
    )
}