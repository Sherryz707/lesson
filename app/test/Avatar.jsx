import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame, useLoader } from "@react-three/fiber";
import { AnimationClip } from 'three'; // Import to confirm type

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useAppContext } from "../store";
import * as THREE from "three";
import { MathUtils} from "three";
import { corresponding, facialExpressions, lerpMorphTarget } from "../_components/ModelUtils"
import { randInt } from "three/src/math/MathUtils";
import { useAnimManagerContext } from "../animManager";

export default function Avatar({...props }) {
  const { state,animFinishShowModal} = useAppContext();
  const { lessons, currentLessonIndex} = state
  const { state: animState, playIndivAnim, playIndivAnimFin,setCurrAnim,fadeAnimFin,fadeAnim } = useAnimManagerContext()
  const {playIndivAnim: replayAnim,fade,currAnim}=animState
  console.log("anim",animState,fade)
  const group = useRef();
  const { nodes, materials, scene,animations } = useGLTF("/models/girl-3.glb");
  // const { animations } = useGLTF("/animations/animations.glb");
  console.log("my girl",animations,nodes,materials,scene)
    const { actions, mixer } = useAnimations(animations, group);
    const [blink, setBlink] = useState(false);
    const [facialExpression, setFacialExpression] = useState("");
    const [animIndex, setAnimIndex] = useState(0);
    const isAnimEnded = useRef(false);
    const isAudioEnded = useRef(false);
    const animationsArr = lessons.length > 0 ? lessons[currentLessonIndex].animations : null
    let jsonFile;
    let lipsync=useRef(null)
    let audio=useRef(null)
    if (replayAnim.length > 0) {
        jsonFile = useLoader(
        THREE.FileLoader,
        replayAnim[0]?.audio
            ? `sounds/${replayAnim[0].audio.split(".mp3")[0]}.json`
            : "", // Use an empty string or handle the case as needed
        (loader) => {
            if (replayAnim[0]?.audio) {
            loader.load(
                `sounds/${replayAnim[0].audio.split(".mp3")[0]}.json`,
                (data) => (lipsync.current = JSON.parse(data)),
                undefined,
                (error) => {
                console.error("Error loading JSON file:", error);
                lipsync.current = null; // Reset if error in loading
                }
            );
            } else {
            console.warn("No audio file for the current animation index.");
            lipsync.current = null; // Set to null if no audio file exists
            }
        }
        );
    } else if (animationsArr && animationsArr.length>0 && animIndex < animationsArr.length) {
        jsonFile = useLoader(
            THREE.FileLoader,
            animationsArr[animIndex]?.audio
                ? `sounds/${animationsArr[animIndex].audio.split(".mp3")[0]}.json`
                : "", // Use an empty string or handle the case as needed
            (loader) => {
                if (animationsArr[animIndex]?.audio) {
                loader.load(
                    `sounds/${animationsArr[animIndex].audio.split(".mp3")[0]}.json`,
                    (data) => (lipsync.current = JSON.parse(data)),
                    undefined,
                    (error) => {
                    console.error("Error loading JSON file:", error);
                    lipsync.current = null; // Reset if error in loading
                    }
                );
                } else {
                console.warn("No audio file for the current animation index.");
                lipsync.current = null; // Set to null if no audio file exists
                }
            }
            );
  }
  useEffect(() => {
    // window.alert("hello outside")
    console.log("FADE STATUS CHANGED",currAnim)
    if (currAnim && fade) {
      // window.alert("hello")
      console.log("in use effect",currAnim,actions[currAnim])
      actions[currAnim].fadeOut(0.5)
      fadeAnimFin()
    }
  },[fade])
    useFrame(() => {
    // Smile
    lerpMorphTarget(scene,"mouthSmileRight", 0.2, 0.5);
    lerpMorphTarget(scene,"mouthSmileLeft", 0.2, 0.5);
    // //FacialExpression
    facialExpression && Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
        const mapping = facialExpressions[facialExpression];
        if (key === "eyeBlinkLeft" || key === "eyeBlinkRight") {
          return; // eyes wink/blink are handled separately
        }
        if (mapping && mapping[key]) {
          lerpMorphTarget(scene,key, mapping[key], 0.1);
        } else {
          lerpMorphTarget(scene,key, 0, 0.1);
        }
      });
    //lipsync
    const appliedMorphTargets = [];
    if (!isAudioEnded.current && audio.current && lipsync.current) {
      const currentAudioTime = audio.current.currentTime;
      for (let i = 0; i < lipsync.current.mouthCues.length; i++) {
        const mouthCue = lipsync.current.mouthCues[i];
        if (
          currentAudioTime >= mouthCue.start &&
          currentAudioTime <= mouthCue.end
        ) {
          appliedMorphTargets.push(corresponding[mouthCue.value]);
          lerpMorphTarget(scene,corresponding[mouthCue.value], 1, 0.2);
          break;
        }
      }
    }

    Object.values(corresponding).forEach((value) => {
      if (appliedMorphTargets.includes(value)) {
        return;
      }
      lerpMorphTarget(scene,value, 0, 0.1);
    });
     // Blinking
    lerpMorphTarget(scene,"eyeBlinkLeft", blink ? 1 : 0, 0.5);
    lerpMorphTarget(scene,"eyeBlinkRight", blink ? 1 : 0, 0.5);
    })

    useEffect(
    () => {
        let currentAction;
        const handleAnimationFinishRep = () => {
            isAnimEnded.current = true;
        if (isAudioEnded.current) {
            isAnimEnded.current = false;
          isAudioEnded.current = false;
          // currentAction.fadeOut(0.5)
          playIndivAnimFin()

        }
    };
        const handleAudioEndRep = () => {
            isAudioEnded.current = true;
            if (isAnimEnded.current) {
              isAnimEnded.current = false;
              isAudioEnded.current = false;
              // currentAction.fadeOut(0.5)
              playIndivAnimFin()
            }
        };
        if (replayAnim.length > 0) {
        const currLesson = replayAnim[0]
        if (currLesson.facialExpression) {
          setFacialExpression(currLesson.facialExpression)
        }
        if (currLesson.audio) {
          lipsync.current = JSON.parse(jsonFile);
          audio.current = (new Audio(`/sounds/${currLesson.audio}`))
            audio.current.play()
            audio.current.addEventListener('ended', handleAudioEndRep);
        }
          if (currLesson.animation) {
          currentAction = actions[currLesson.animation];
          currentAction.reset().fadeIn(0.2).play();
          currentAction.loop = THREE.LoopOnce;
          currentAction.clampWhenFinished = true;
          currentAction.timeScale = 0.5; // 0.5 will make it play at half speed; adjust as needed
          // Add the event listener
          mixer.addEventListener("finished", handleAnimationFinishRep);
        }
        }
             // Clean up event listener on effect cleanup
      return () => {
          mixer.removeEventListener("finished", handleAnimationFinishRep);
          audio.current?.removeEventListener('ended', handleAudioEndRep);
      };
    }
    , [replayAnim])
  useEffect(() => {
        let currentAction
        const handleAnimationFinish = () => {
            isAnimEnded.current = true;
          if (animIndex != animationsArr.length - 1) {
              currentAction.fadeOut(0.5)
          }
          if (isAudioEnded.current) {
              isAnimEnded.current = false;
              isAudioEnded.current = false;
              setAnimIndex((curr) => curr + 1)
          }
        };
        const handleAudioEnd = () => {
            isAudioEnded.current = true;
            if(animIndex!=animationsArr.length-1){
                currentAction.fadeOut(0.5)
            }
            if (isAnimEnded.current) {
                isAnimEnded.current = false;
                isAudioEnded.current = false;
                setAnimIndex((curr) => curr + 1)
            }
        };
        if (state.status == "active" && lessons.length > 0 && animIndex < animationsArr.length) {
            const currLesson = animationsArr[animIndex] 
            if (currLesson.facialExpression) {
                setFacialExpression(currLesson.facialExpression)
            }
            if (currLesson.audio) {
                lipsync.current = JSON.parse(jsonFile);
                audio.current=(new Audio(`/sounds/${currLesson.audio}`))
                audio.current.play()
                audio.current.addEventListener('ended', handleAudioEnd);
            }
            if (currLesson.animation) {
                
                currentAction = actions[currLesson.animation];
                currentAction.reset().fadeIn(0.2).play();
                currentAction.loop = THREE.LoopOnce;
                currentAction.clampWhenFinished = true;
                // Add the event listener
                mixer.addEventListener("finished", handleAnimationFinish);
            } 
           
        } else if (state.status == "active" && animIndex >= animationsArr.length - 1) {
            
            setFacialExpression("funnyFace")
            console.log("animationarr",animationsArr,animationsArr[-1])
          // actions[animationsArr.slice(-1)[0].animation].fadeOut(0.5)
          setCurrAnim(animationsArr.slice(-1)[0].animation)
          // SetAnimToFade(actions[animationsArr.slice(-1)[0].animation])
          animFinishShowModal()
      }
        // Clean up event listener on effect cleanup
      return () => {
          mixer.removeEventListener("finished", handleAnimationFinish);
          audio.current?.removeEventListener('ended', handleAudioEnd);
      };
    }
    ,[state.status,animIndex,animationsArr])
  return (
    <>
    <group dispose={null} ref={group} {...props}>
      <primitive object={nodes.mixamorigHips} />
      <skinnedMesh name="Wolf3D_Body" geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Bottom" geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Footwear" geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
      <skinnedMesh name="Wolf3D_Outfit_Top" geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
      <skinnedMesh name="Wolf3D_Hair" geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
      <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
      <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
      <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
      </group>
    </>
  );
}

useGLTF.preload("/models/girl.glb");
