import React, { Dispatch, SetStateAction, useEffect, useRef, useState } from "react";
import {
  Float,
  Circle,
  MeshReflectorMaterial,
  Icosahedron,
  Plane,
  OrbitControls,
  PerspectiveCamera,
  Box,
  useTexture,
  Environment,
  Sphere,
  Stats,
  Torus,
  Octahedron,
  Cylinder,
  Stars,
  Sky,
  Sparkles,
} from "@react-three/drei";
import { useFrame, useThree } from "@react-three/fiber";
import useStore from "../singleComponents/Hooks/useStore";
import { useTimeline } from "../singleComponents/Hooks/useTimeLine";
import * as THREE from 'three'
import { Mesh } from "three";
import { Statue } from '../singleComponents/sceneComponents/Statue'
import { useSpring, animated, config } from "@react-spring/three";
import { useControls, folder } from 'leva'

export default function ExampleScene(props: {
  setReveal: Dispatch<SetStateAction<boolean>>;
}) {
  let meshRef = useRef<THREE.Mesh>();
  const { viewport, mouse } = useThree();

  //Importing global scroll function
  const scroll = useStore((state) => state.scroll);

  const GPUTier = useStore((state) => state.GPUTier);

  //Keyframes for scroll based animations
  const keyframes = {
    rotation: [
      { time: 0, val: 0 },
      { time: 500, val: -100, easing: "easeInSine" },
      { time: 1000, val: 100, easing: "easeInSine" },
    ],
  };

  const remapKeyframes = {
    frame: [
      { time: 0, val: 0 },
      { time: 1000, val: 1000, easing: "linear" },
    ],
  };

  const [timeline, axes] = useTimeline(keyframes);
  const [timeRemap, timeAxe] = useTimeline(remapKeyframes);

  // OBJECT REFS
  const torusRef = useRef<Mesh>(null!)
  const boxRef = useRef<Mesh>(null!)
  const diamondRef = useRef<Mesh>(null!)
  const cylinderRef = useRef<Mesh>(null!)
  const cameraRef = useRef<Mesh>(null!)
  const starsRef = useRef<Mesh>(null!)
  const icoRef = useRef<Mesh>(null!)
  const statue = useRef<Mesh>(null!)

  // LEVA CONTROLS
  const levaControls = useControls(
    "directionalLight", {
      intensity: {value: 4, min:0, max:10, step:0.2 }, 
      castShadow: true, 
      position: [0,2,-5] 
    }
  )

  useFrame(({ clock }) => {
    if (icoRef.current !== undefined) {
      icoRef.current.rotateY((mouse.x * viewport.width) / 500);
      icoRef.current.rotateZ((mouse.y * viewport.height) / 500);
    }
    cylinderRef.current.rotateX((mouse.y * viewport.width) / 5000);
    const t = clock.getElapsedTime()

    torusRef.current.rotation.y += .04
    boxRef.current.rotation.x += .01

    if(hover) {
      diamondRef.current.rotation.y += .07
    } else {
      diamondRef.current.rotation.y += -.07
    }

    // test to have a specific event occur at a certain point in camera movement
    // if ((cameraRef.current.position.z > 5) && (cameraRef.current.position.z < 7)) {
    //   boxRef.current.position.x = -2 + Math.sin(t) * 10
    // } else {
    //   boxRef.current.position.x = -2
    // }

    cylinderRef.current.position.y = Math.sin(t)
    cameraRef.current.position.z = 1 + Math.sin(t / 17.5) * 10

    // scrubbing through the keyframes using the interpolated scroll value
    if (scroll?.animation.changed) {
      const y = scroll.get()[0];
      
      // @ts-ignore
      timeRemap.seek(timeRemap.duration * y);
      // @ts-ignore
      timeline.seek(timeAxe.current.frame);
      // @ts-ignore
      icoRef.current?.rotateY(axes.current.rotation / 1500);
    }

    // useSpring without changing state
    // x.to((x)=>{
    //   if(icoRef.current){
    //     icoRef.current.scale.x = x
    //     icoRef.current.scale.y = x
    //     icoRef.current.scale.z = x
    //   }
    // })
  });

  const [hover, setHover] = useState(false)
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    props.setReveal(true);
  }, []);

  // checkerboard texture
  const checkerboardTexture = useTexture('/textures/checkerboardTexture.png')
  checkerboardTexture.repeat.set(4, 200)
  checkerboardTexture.wrapS = THREE.RepeatWrapping
  checkerboardTexture.wrapT = THREE.RepeatWrapping

  const cylinderTexture = useTexture('/textures/cylinder_textures/floor_tiles_06_nor_gl_1k.jpg')
  cylinderTexture.repeat.set(2, 90)
  cylinderTexture.wrapS = THREE.RepeatWrapping
  cylinderTexture.wrapT = THREE.RepeatWrapping

  const {x} = useSpring({ 
    loop: {reverse: true},
    x: 1,
    to: {x: 10}, 
    from: {x: 1},
    config: config.wobbly
  })

   const {scale} = useSpring({
    scale: clicked ? 1 : .5,
 })

  // use-spring scroll interactions   
  const options = {
    mass: 1,
    tension: 260,
    friction: 100,
    precision: 0.0000001,
    velocity: 2,
    clamp: true,  
  }
  const [{ y }, setScroll] = useSpring(()=> ({
    y: [0],
    config: options
  }))
  const handleScroll = () => {
    setScroll({
      y: [window.scrollY / (document.body.offsetHeight - window.screen.height)]
    })
  }
  useEffect(() => {
    window.addEventListener("wheel", handleScroll);
    // removing the scroll event listener after handle
    return () => window.removeEventListener("wheel", handleScroll);
  }, [handleScroll])

  useFrame(({clock}) => {
    const t = clock.getElapsedTime()

    y.to((y: any) => {
      cameraRef.current.position.z += ((1 + Math.sin(t / 17.5) * 10) * y)      
    })
  })

  return (
    <>
    {/* DEVELOPMENT */}
    {/* <OrbitControls /> */}
    {/* <Stats /> */}

    {/* ENVIRONMENT */}
    <directionalLight 
      intensity={levaControls.intensity} 
      castShadow={levaControls.castShadow} 
      position={levaControls.position} 
    />
    
    <Environment 
      files={'/hdris/skybox.hdr'} 
      background={true} 
    /> 
    {/* <Stars 
      ref={starsRef} 
      radius={100} 
      depth={75} 
      count={500} 
      factor={4} 
      saturation={1} 
      fade 
      speed={1} 
    /> */}

    <PerspectiveCamera
      // args={[100,100,10,10]}
      // rotation={[x: 4, y: 4]}
      rotation={[0,.25,0]}
      position={[3,1,10]} 
      makeDefault
      ref={cameraRef}
    />

    {/* SHAPES */}
    <Plane
      receiveShadow
      args={[1,100,1]} 
      rotation-x={-Math.PI / 2} 
      scale={10}
      
    >

    <meshStandardMaterial 
      map={checkerboardTexture}
      roughness={0}
      metalness={.2} 
     />
    </Plane>

    <Float position={[0,.2,0]}>

      <Box 
        position={[-2,1.4,0]} 
        ref={boxRef} 
        castShadow
      >
        <meshNormalMaterial />
      </Box>

      <Torus
        args={[1,.1,3]}
        position={[-2,1.4,0]} 
        scale={1.5} 
        ref={torusRef} 
        castShadow
      >
        <meshNormalMaterial />
      </Torus>

      <Sphere 
        castShadow 
        position={[2,3,-2]}
        scale={.25}
      >

        <meshStandardMaterial
          roughness={0} 
          metalness={1}
        />
      </Sphere>
      <Octahedron
        position={[-1,2.8,-7]}
        scale={.5}
        ref={diamondRef}
        castShadow
        onPointerEnter={() => setHover(true)}
        onPointerOut={() => setHover(false)}
      > 
      <meshStandardMaterial 
        color={'pink'}
         roughness={0} 
          metalness={1}
      />
    </Octahedron>
    </Float>
    <Float floatIntensity={2} >
    <Sphere 
        castShadow 
        position={[2,2,-55]}
        scale={.7}
      >

        <meshStandardMaterial
          roughness={0} 
          metalness={1}
        />
      </Sphere>

    </Float>


    <Cylinder
      args={[1,1,20, 10]}
      scale={.5}
      position={[-6,2,-16]}
      ref={cylinderRef}
    >
      <meshStandardMaterial 
        map={cylinderTexture}
      />
    </Cylinder>

    {/* <animated.mesh >
      <boxGeometry scale={scale}/>
      <meshStandardMaterial />
    </animated.mesh> */}

    <animated.mesh 
      position={[-2,2,-20]}
      ref={icoRef}
      castShadow
      onClick={(() => setClicked(!clicked))}
      scale={scale}
    >
      <boxGeometry args={[1,2,3]}/>
      <meshStandardMaterial 
        color={clicked ? "red" : "blue"}
        metalness={2}
        roughness={0}
      />
    </animated.mesh>

    <Icosahedron
      position={[7,2,-7]}
      scale={3}
    >
      <meshStandardMaterial
        color="blue"
        metalness={2}
        roughness={0}
      />
    </Icosahedron>

    <Statue 

        position={[0,-3,-35]}
        scale={20}
        receiveShadow
        ref={statue}
        // rotation={[4,3,4]}
      />
    </>
  );
}
