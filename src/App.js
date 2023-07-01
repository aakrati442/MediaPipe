import React, { useEffect, useRef } from "react";
import { createHandLandmarker } from "./handLandmarker";
import { DrawingUtils, HandLandmarker } from "@mediapipe/tasks-vision";

const App = () => {
  const canvasRef = useRef(null);
  const contextRef = useRef(null);
  const inputVideoRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const videoRef = inputVideoRef.current;
      if (canvas) {
        contextRef.current = canvas.getContext("2d");
      }

    if (contextRef.current && canvas && videoRef) {
      createHandLandmarker().then((handLandmarker) => {
        console.log(handLandmarker);
        const drawingUtils = new DrawingUtils(contextRef.current);
        let lastVideoTime = -1;
        let results = undefined;
        
        function countFingers(landmarks) {
          // Thumb
          const thumbIsOpen =
            landmarks[4][1] < landmarks[3][1] &&
            landmarks[3][1] < landmarks[2][1] &&
            landmarks[2][1] < landmarks[1][1];
          // Index finger
          const indexIsOpen =
            landmarks[8][2] < landmarks[7][2] &&
            landmarks[7][2] < landmarks[6][2] &&
            landmarks[6][2] < landmarks[5][2];
          // Middle finger
          const middleIsOpen =
            landmarks[12][2] < landmarks[11][2] &&
            landmarks[11][2] < landmarks[10][2] &&
            landmarks[10][2] < landmarks[9][2];
          // Ring finger
          const ringIsOpen =
            landmarks[16][2] < landmarks[15][2] &&
            landmarks[15][2] < landmarks[14][2] &&
            landmarks[14][2] < landmarks[13][2];
          // Pinky finger
          const pinkyIsOpen =
            landmarks[20][2] < landmarks[19][2] &&
            landmarks[19][2] < landmarks[18][2] &&
            landmarks[18][2] < landmarks[17][2];

          // Count the number of open fingers
          const count =
            [thumbIsOpen, indexIsOpen, middleIsOpen, ringIsOpen, pinkyIsOpen].filter(
              (open) => open
            ).length;

          return count;
        }

        function predict() {
          canvas.style.width = videoRef.videoWidth;
          canvas.style.height = videoRef.videoHeight;
          canvas.width = videoRef.videoWidth;
          canvas.height = videoRef.videoHeight;

          let startTimeMs = performance.now();
          if (lastVideoTime !== videoRef.currentTime) {
            lastVideoTime = videoRef.currentTime;
            results = handLandmarker.detectForVideo(videoRef, startTimeMs);
            console.log(results);
          }

          contextRef.current.save();
          contextRef.current.clearRect(0, 0, canvas.width, canvas.height);
          if (results.landmarks) {
            for (const landmarks of results.landmarks) {
              drawingUtils.drawConnectors(
                landmarks,
                HandLandmarker.HAND_CONNECTIONS,
                {
                  color: "#00FF00",
                  lineWidth: 5,
                }
              );

              drawingUtils.drawLandmarks(landmarks, {
                color: "#FF0000",
                lineWidth: 2,
              });
              //const count=countFingers(landmarks);
              //setFingerCount(count);
            }
          }

          contextRef.current.restore();
          window.requestAnimationFrame(predict);
        }
        navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
          videoRef.srcObject = stream;
          videoRef.addEventListener("loadeddata", predict);
        });
      });
    }
  }, []);
  return (
    <div style={{ position: "relative" }}>
      <video
        id="webcam"
        style={{ position: "absolute" }}
        autoPlay
        playsInline
        ref={inputVideoRef}
      ></video>
      <canvas
        ref={canvasRef}
        id="output_canvas"
        style={{
          position: "absolute",
          left: "0px",
          top: "0px",
        }}
      ></canvas>
    </div>
  );
};

export default App;