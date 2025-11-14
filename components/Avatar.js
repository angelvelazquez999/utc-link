import React, { useRef, useEffect, useState } from "react";
import { useGLTF, useAnimations } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";

export default function Avatar({ url, audioAnalyser, isSpeaking }) {
  const { scene, animations } = useGLTF(url);
  const { actions, mixer } = useAnimations(animations, scene);
  const groupRef = useRef();
  const headBoneRef = useRef();
  const blinkTimeRef = useRef(0);
  const headMovementRef = useRef({ time: 0, offsetX: 0, offsetY: 0 });
  const expressionTimerRef = useRef(0);
  const [currentExpression, setCurrentExpression] = useState('neutral');

  // Expresiones faciales predefinidas
  const expressions = {
    neutral: { mouthSmile: 0, browInnerUp: 0, eyeWideLeft: 0, eyeWideRight: 0 },
    happy: { mouthSmile: 0.7, browInnerUp: 0.3, eyeSquintLeft: 0.2, eyeSquintRight: 0.2 },
    excited: { mouthSmile: 0.9, browInnerUp: 0.5, eyeWideLeft: 0.4, eyeWideRight: 0.4 },
    thinking: { mouthSmile: 0.1, browInnerUp: 0.4, eyeSquintLeft: 0.1, eyeSquintRight: 0.1 },
    friendly: { mouthSmile: 0.5, browInnerUp: 0.2, eyeWideLeft: 0.1, eyeWideRight: 0.1 },
    surprised: { mouthSmile: 0.2, browInnerUp: 0.8, eyeWideLeft: 0.7, eyeWideRight: 0.7, mouthOpen: 0.3 },
  };

  useEffect(() => {
    console.log("Available animations:", animations.map(a => a.name));
    console.log("Available actions:", Object.keys(actions));
    
    // Buscar el hueso de la cabeza para movimiento natural
    scene.traverse((child) => {
      if (child.isBone && (child.name.toLowerCase().includes('head') || child.name.toLowerCase().includes('neck'))) {
        headBoneRef.current = child;
        console.log("Found head bone:", child.name);
      }
      if (child.isMesh && child.morphTargetInfluences) {
        console.log("Found mesh with morphTargets:", child.name, child.morphTargetDictionary);
      }
    });
  }, [scene, animations, actions]);

  // Función para cambiar expresiones
  const applyExpression = (expressionName, intensity = 1) => {
    const expression = expressions[expressionName];
    if (!expression) return;

    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences) {
        const dict = child.morphTargetDictionary;
        
        Object.keys(expression).forEach(morphName => {
          if (dict && dict[morphName] !== undefined) {
            const targetValue = expression[morphName] * intensity;
            // Interpolación suave
            const currentValue = child.morphTargetInfluences[dict[morphName]];
            child.morphTargetInfluences[dict[morphName]] = 
              currentValue + (targetValue - currentValue) * 0.1;
          }
        });
      }
    });
  };

  // Animación continua (parpadeo, respiración, movimientos sutiles, expresiones)
  useFrame((state, delta) => {
    const time = state.clock.elapsedTime;

    // Movimiento sutil de la cabeza (siempre activo)
    if (groupRef.current) {
      // Respiración suave
      const breathe = Math.sin(time * 0.5) * 0.01;
      groupRef.current.position.y = -4.8 + breathe;
      
      // Movimiento sutil de cabeza cuando NO está hablando
      if (!isSpeaking) {
        const idleMovementX = Math.sin(time * 0.3) * 0.03;
        const idleMovementY = Math.cos(time * 0.2) * 0.02;
        groupRef.current.rotation.y = idleMovementX;
        groupRef.current.rotation.x = idleMovementY;
        groupRef.current.rotation.z = Math.sin(time * 0.25) * 0.01; // Leve inclinación
      } else {
        // Movimiento más animado cuando habla
        const ref = headMovementRef.current;
        ref.time += delta;
        
        if (ref.time > 0.3) { // Cambiar dirección más frecuentemente
          ref.time = 0;
          ref.offsetX = (Math.random() - 0.5) * 0.12;
          ref.offsetY = (Math.random() - 0.5) * 0.08;
        }
        
        // Interpolación suave hacia el nuevo objetivo
        groupRef.current.rotation.y += (ref.offsetX - groupRef.current.rotation.y) * 0.08;
        groupRef.current.rotation.x += (ref.offsetY - groupRef.current.rotation.x) * 0.08;
        groupRef.current.rotation.z += (Math.sin(time * 2) * 0.02 - groupRef.current.rotation.z) * 0.05;
      }
    }

    // Cambiar expresiones aleatoriamente cuando habla
    if (isSpeaking) {
      expressionTimerRef.current += delta;
      
      if (expressionTimerRef.current > 2) { // Cada 2 segundos
        const expressionsList = ['friendly', 'happy', 'excited', 'thinking'];
        const randomExpression = expressionsList[Math.floor(Math.random() * expressionsList.length)];
        setCurrentExpression(randomExpression);
        expressionTimerRef.current = 0;
      }
      
      applyExpression(currentExpression, 0.7);
    } else {
      applyExpression('neutral', 0.3);
    }

    // Parpadeo natural
    blinkTimeRef.current += delta;
    const blinkCycle = Math.sin(blinkTimeRef.current * 2.5);
    const shouldBlink = blinkCycle > 0.95 || (Math.random() > 0.99); // Parpadeo más frecuente
    
    scene.traverse((child) => {
      if (child.isMesh && child.morphTargetInfluences) {
        const dict = child.morphTargetDictionary;
        
        // Parpadeo
        const blinkTargets = ['eyesClosed', 'eyeBlinkLeft', 'eyeBlinkRight'];
        blinkTargets.forEach(targetName => {
          if (dict && dict[targetName] !== undefined) {
            const targetBlink = shouldBlink ? 1 : 0;
            child.morphTargetInfluences[dict[targetName]] += 
              (targetBlink - child.morphTargetInfluences[dict[targetName]]) * 0.4;
          }
        });
      }
    });
  });

  // Animación basada en audioAnalyser (cuando hay audio real)
  useEffect(() => {
    if (!audioAnalyser) return;
    let raf;
    let smoothedEnergy = 0;
    let prevEnergy = 0;

    const tick = () => {
      const data = new Uint8Array(audioAnalyser.frequencyBinCount);
      audioAnalyser.getByteFrequencyData(data);
      
      // Calcular energía del audio
      const energy = data.reduce((s, v) => s + v, 0) / data.length / 255;
      
      // Suavizar con dos niveles para más naturalidad
      smoothedEnergy = smoothedEnergy * 0.5 + energy * 0.5;
      const deltaEnergy = Math.abs(smoothedEnergy - prevEnergy);
      prevEnergy = smoothedEnergy;
      
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          
          // Boca abierta con variación basada en cambio de energía
          if (dict && dict['mouthOpen'] !== undefined) {
            const mouthOpen = Math.min(0.9, smoothedEnergy * 4 + deltaEnergy * 3);
            child.morphTargetInfluences[dict['mouthOpen']] += 
              (mouthOpen - child.morphTargetInfluences[dict['mouthOpen']]) * 0.5;
          }
          
          // Diferentes formas de boca según la energía
          if (dict && dict['mouthFunnel'] !== undefined) {
            const funnel = smoothedEnergy > 0.3 ? smoothedEnergy * 0.3 : 0;
            child.morphTargetInfluences[dict['mouthFunnel']] += 
              (funnel - child.morphTargetInfluences[dict['mouthFunnel']]) * 0.2;
          }
          
          if (dict && dict['mouthPucker'] !== undefined && smoothedEnergy > 0.5) {
            const pucker = (smoothedEnergy - 0.5) * 0.4;
            child.morphTargetInfluences[dict['mouthPucker']] += 
              (pucker - child.morphTargetInfluences[dict['mouthPucker']]) * 0.2;
          }
        }
      });
      
      raf = requestAnimationFrame(tick);
    };

    tick();
    return () => cancelAnimationFrame(raf);
  }, [audioAnalyser, scene]);

  // Animación procedural cuando se usa Web Speech API
  useEffect(() => {
    if (!isSpeaking) return;
    
    let raf;
    let time = 0;
    let phase = 0;
    let syllableTime = 0;

    const tick = () => {
      time += 0.016; // ~60fps
      syllableTime += 0.016;
      
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          
          // Animación de boca más realista con múltiples ondas
          if (dict && dict['mouthOpen'] !== undefined) {
            // Combinar varias frecuencias para más naturalidad
            const fast = Math.sin(time * 18 + phase) * 0.5 + 0.5; // Rápida para sílabas
            const medium = Math.sin(time * 9) * 0.5 + 0.5; // Media para palabras
            const slow = Math.sin(time * 4) * 0.3 + 0.4; // Lenta para ritmo general
            const random = Math.random() * 0.15; // Variación aleatoria
            
            const mouthOpen = Math.min(0.85, (fast * 0.35 + medium * 0.3 + slow * 0.25 + random * 0.1));
            
            child.morphTargetInfluences[dict['mouthOpen']] = mouthOpen;
            
            // Cambiar fase cada "sílaba"
            if (syllableTime > 0.15 && Math.random() > 0.5) {
              phase = Math.random() * Math.PI;
              syllableTime = 0;
            }
          }
          
          // Variaciones de forma de boca
          if (dict && dict['mouthFunnel'] !== undefined) {
            const funnel = Math.sin(time * 5) * 0.15 + 0.15;
            child.morphTargetInfluences[dict['mouthFunnel']] = Math.max(0, funnel);
          }
          
          if (dict && dict['mouthPucker'] !== undefined) {
            const pucker = Math.sin(time * 7 + 1) * 0.1 + 0.1;
            child.morphTargetInfluences[dict['mouthPucker']] = Math.max(0, pucker);
          }
        }
      });
      
      raf = requestAnimationFrame(tick);
    };

    console.log("Starting expressive procedural animation");
    tick();
    
    return () => {
      cancelAnimationFrame(raf);
      // Volver a neutral cuando termine
      scene.traverse((child) => {
        if (child.isMesh && child.morphTargetInfluences) {
          const dict = child.morphTargetDictionary;
          const targets = ['mouthOpen', 'mouthFunnel', 'mouthPucker'];
          targets.forEach(target => {
            if (dict && dict[target] !== undefined) {
              child.morphTargetInfluences[dict[target]] = 0;
            }
          });
        }
      });
    };
  }, [isSpeaking, scene]);

  return (
    <group ref={groupRef} position={[0, 3, -1]}>
      <primitive 
        object={scene} 
        scale={3}
      />
    </group>
  );
}
