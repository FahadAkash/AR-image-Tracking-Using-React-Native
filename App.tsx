import {
  ViroARScene,
  ViroARSceneNavigator,
  ViroBox,
  ViroText,
  ViroTrackingReason,
  ViroTrackingStateConstants,
  ViroARImageMarker,
  ViroARTrackingTargets,
  ViroAnimations,
  ViroMaterials,
  ViroQuad,
} from "@reactvision/react-viro";
import React, { useState, useEffect, useRef } from "react";
import { StyleSheet } from "react-native";

// Register the target image
ViroARTrackingTargets.createTargets({
  targetImage: {
    source: require("./qr.png"),
    orientation: "Up",
    physicalWidth: 0.1,
  },
});

// Define animations
ViroAnimations.registerAnimations({
  rotate: {
    properties: {
      rotateY: "+=360",
    },
    duration: 2500,
  },
  rotateLoop: {
    properties: {
      rotateY: "+=360",
    },
    duration: 2500,
  },
  rotateLightLoop: {
    properties: {
      rotateY: "+=360",
    },
    duration: 50000,
  },
});

// Add materials for floor and boxes
ViroMaterials.createMaterials({
  blue: {
    diffuseColor: "#0000FF",
  },
  floor: {
    diffuseColor: "#CCCCCC",
  },
  box: {
    diffuseColor: "#FF0000",
  },
});

const HelloWorldSceneAR = () => {
  const [text, setText] = useState("Initializing AR...");
  const [isTracking, setIsTracking] = useState(false);
  const [boxes, setBoxes] = useState<{ id: number; position: number[] }[]>([]);
  const boxIdRef = useRef(0);

  useEffect(() => {
    if (isTracking) {
      // Spawn new box every 2 seconds
      const interval = setInterval(() => {
        setBoxes((prevBoxes) => [
          ...prevBoxes,
          {
            id: boxIdRef.current++,
            position: [
              Math.random() * 0.4 - 0.2,
              0.5,
              Math.random() * 0.4 - 0.2,
            ],
          },
        ]);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isTracking]);

  function onInitialized(state: any, _reason: ViroTrackingReason) {
    if (state === ViroTrackingStateConstants.TRACKING_NORMAL) {
      setText("Find the target image...");
    } else if (state === ViroTrackingStateConstants.TRACKING_UNAVAILABLE) {
      setText("Tracking unavailable");
    }
  }

  return (
    <ViroARScene onTrackingUpdated={onInitialized}>
      <ViroText
        text={text}
        scale={[0.5, 0.5, 0.5]}
        position={[0, 0, -1]}
        style={styles.helloWorldTextStyle}
      />
      <ViroARImageMarker
        target="targetImage"
        onAnchorFound={() => {
          setIsTracking(true);
          setText("Target Found!");
        }}
        onAnchorRemoved={() => {
          setIsTracking(false);
          setText("Target Lost!");
          setBoxes([]);
        }}
      >
        {/* Floor */}
        <ViroQuad
          position={[0, 0, 0]}
          rotation={[-90, 0, 0]}
          width={0.5}
          height={0.5}
          materials={["floor"]}
          physicsBody={{
            type: "Static",
            restitution: 0.3,
            friction: 0.8,
          }}
        />

        {/* Boxes */}
        {boxes.map(box => (
          <ViroBox
            key={box.id}
            position={box.position as [number, number, number]}
            height={0.05}
            width={0.05}
            length={0.05}
            materials={["box"]}
            physicsBody={{
              type: "Dynamic",
              mass: 1,
              force: [0, 0, 0],
              torque: [0, 0, 0],
            }}
          />
        ))}
      </ViroARImageMarker>
    </ViroARScene>
  );
};

export default () => {
  return (
    <ViroARSceneNavigator
      autofocus={true}
      initialScene={{
        scene: HelloWorldSceneAR,
      }}
      style={styles.f1}
    />
  );
};

var styles = StyleSheet.create({
  f1: { flex: 1 },
  helloWorldTextStyle: {
    fontFamily: "Arial",
    fontSize: 30,
    color: "#ffffff",
    textAlignVertical: "center",
    textAlign: "center",
  },
});
