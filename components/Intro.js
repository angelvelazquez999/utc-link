import React from 'react'
import Image from 'next/image';
import Background from '../public/images/2.jpg';
import Logo from '../public/images/logo_mini.png';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export default function Intro() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
      target: container,
      offset: ['start start', 'end start']
    })
  
    const y = useTransform(scrollYProgress, [0, 1], ["0vh", "150vh"])
  
    return (
      <div ref={container} className='h-screen overflow-hidden relative'>
        <motion.div style={{y}} className='relative h-full'>
          <Image src={Background} fill alt="image" style={{objectFit: "cover"}} className='blur-[4px]'/>
        </motion.div>
        
        {/* Logo centrado */}
        <div className='absolute inset-0 flex items-center justify-center z-10'>
          <Image 
            src={Logo} 
            alt="Logo" 
            width={420} 
            height={420} 
            className='object-contain'
            unoptimized
          />
        </div>
      </div>
    )
}