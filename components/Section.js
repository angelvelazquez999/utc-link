import Image from 'next/image';
import Background from '../public/images/1.jpg';
import { useScroll, useTransform, motion } from 'framer-motion';
import { useRef } from 'react';

export default function Section() {
    const container = useRef(null);
    const { scrollYProgress } = useScroll({
        target: container,
        offset: ["start end", 'end start']
    })
    const y = useTransform(scrollYProgress, [0, 1], ["-10%", "10%"]);

    return (
        <div
            ref={container}
            className='relative flex items-center justify-center h-screen overflow-hidden'
            style={{ clipPath: "polygon(0% 0, 100% 0%, 100% 100%, 0 100%)" }}
        >
            <div className='relative z-10 p-20 w-full h-full flex flex-col justify-between'>
                {/* Overlay con gradiente de marca */}
                <div className='absolute inset-0 bg-gradient-to-br from-[#0a6448]/80 via-[#0f2755]/70 to-[#0a6448]/80 backdrop-blur-sm'></div>

                {/* Contenido */}
                <div className='relative z-10'>
                    <p className='w-full md:w-[60vw] text-[3vw] md:text-[2vw] self-end uppercase text-white font-light leading-relaxed ml-auto text-right'>
                        Más Enlace es la plataforma oficial de la Universidad Tecnológica de Coahuila (UTC) que conecta directamente a nuestros estudiantes con las mejores oportunidades de prácticas y estadías profesionales                </p>
                </div>

                <div className='relative z-10'>
                    <h2 className='text-[8vw] md:text-[5vw] uppercase text-white font-bold tracking-tight'>
                        Más <span className='text-[#0a6448] bg-white px-4 py-2 inline-block'>Enlace</span>
                    </h2>
                </div>
            </div>
            <div className='fixed top-[-10vh] left-0 h-[120vh] w-full'>
                <motion.div style={{ y }} className='relative w-full h-full'>
                    <Image src={Background} fill alt="image" style={{ objectFit: "cover" }} />
                </motion.div>
            </div>
        </div>
    )
}