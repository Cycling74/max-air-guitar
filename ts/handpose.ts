// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process unless
// nodeIntegration is set to true in webPreferences.
// Use preload.js to selectively enable features
// needed in the renderer process.



// Copyright 2023 The MediaPipe Authors.

// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at

// http://www.apache.org/licenses/LICENSE-2.0

// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

import {
	HandLandmarker,
	FilesetResolver,
	HandLandmarkerResult
} from "@mediapipe/tasks-vision";

import {
    bindMaxFunctions
} from "./max-bridge";

import * as drawing_utils from "@mediapipe/drawing_utils";

import {
	HAND_CONNECTIONS
} from "@mediapipe/hands";

const liveView = document.getElementById("liveView");
enum RunningMode {
	IMAGE = "IMAGE",
	VIDEO = "VIDEO"
};

let handLandmarker: HandLandmarker = undefined;
let runningMode = RunningMode.IMAGE;
let enableWebcamButton: HTMLButtonElement = undefined;
let webcamRunning: Boolean = false;
let maxApi = (window as any).max;
let lastVideoTime = -1;
let results: HandLandmarkerResult = undefined;
let points: number[];

if (maxApi) {
	bindMaxFunctions();

    maxApi.bindInlet("open", (deviceId: string) => {
        maxApi.outlet("open", deviceId);
        enableCam(null, deviceId);
    });

	maxApi.bindInlet("string", function (...args: number[]) {
		points = args.slice();
	});

	document.getElementById("webcamButton")!.classList.add("hidden");
} else {
    document.getElementById("webcamButton")!.classList.remove("hidden");
}

function lerp(value: number, inputStart: number, inputEnd: number, outputStart: number, outputEnd: number): number {
    // First, you calculate how far along the input range the value is
    const fraction = (value - inputStart) / (inputEnd - inputStart);

    // Then you apply that fraction to the output range
    return outputStart + fraction * (outputEnd - outputStart);
}

// Before we can use HandLandmarker class we must wait for it to finish
// loading. Machine Learning models can be large and take a moment to
// get everything needed to run.
const createHandLandmarker = async () => {
	const vision = await FilesetResolver.forVisionTasks(
		"https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.0/wasm"
	);
	handLandmarker = await HandLandmarker.createFromOptions(vision, {
		baseOptions: {
			modelAssetPath: `https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task`,
			delegate: "GPU"
		},
		runningMode: runningMode,
		numHands: 2
	});
	liveView.classList.remove("hidden");
};
createHandLandmarker();

/********************************************************************
// Continuously grab image from webcam stream and detect it.
********************************************************************/

const video = document.getElementById("webcam") as HTMLVideoElement;
const canvasElement = document.getElementById(
	"output_canvas"
	) as HTMLCanvasElement;
const canvasCtx = canvasElement.getContext("2d");
	
// Check if webcam access is supported.
const hasGetUserMedia = () => !!navigator.mediaDevices?.getUserMedia;

// If webcam supported, add event listener to button for when user
// wants to activate it.
if (hasGetUserMedia()) {
	enableWebcamButton = document.getElementById("webcamButton") as HTMLButtonElement;
	enableWebcamButton.addEventListener("click", enableCam);
} else {
	console.warn("getUserMedia() is not supported by your browser");
}

// Enable the live webcam view and start detection.
function enableCam(event: MouseEvent, deviceId?: string) {
	if (!handLandmarker) {
		console.log("Wait! objectDetector not loaded yet.");
		return;
	}
	
	if (webcamRunning === true) {
		webcamRunning = false;
		enableWebcamButton.innerText = "ENABLE PREDICTIONS";
	} else {
		webcamRunning = true;
		enableWebcamButton.innerText = "DISABLE PREDICTIONS";
	}
	
	// getUsermedia parameters.
	const constraints = deviceId
		? {
			video: {
				deviceId: {
					exact: deviceId
				}
			}
		}
		: {
			video: true
		};
	
	// Activate the webcam stream.
	navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
		video.srcObject = stream;
		video.addEventListener("loadeddata", predictWebcam);
	});
}

function onResultsHands() {

    // canvas.save();
    // canvas.clearRect(0, 0, overlay.width, overlay.height);
    
    // if(drawImage) {
    //   canvas.drawImage(results.image, 0, 0, overlay.width, overlay.height);
    // }
    
    // if (results.multiHandLandmarks && results.multiHandedness) {
    //   const output = {};
    //   for (let index = 0; index < results.multiHandLandmarks.length; index++) {
        
    //     const classification = results.multiHandedness[index];
    //     const isRightHand = classification.label === 'Right';
    //     const landmarks = results.multiHandLandmarks[index];
  
    //     const entry = {};
    //     entry.landmarks = landmarks;
    //     output[classification.label] = entry;
  
    //     if(drawHands) {
    //       drawConnectors(
    //         canvas, landmarks, HAND_CONNECTIONS,
    //           {color: isRightHand ? '#00FF00' : '#FF0000'}),
    //       drawLandmarks(canvas, landmarks, {
    //         color: isRightHand ? '#00FF00' : '#FF0000',
    //         fillColor: isRightHand ? '#FF0000' : '#00FF00',
    //         radius: (x) => {
    //           return lerp(x.from.z, -0.15, .1, 10, 1);
    //         }
    //       });
    //     }
    //   }
  
    //   //outputMaxDict(JSON.stringify(output));
    //   setMaxDict(output);
    //   outputMax("update");
  
    // }
    // canvas.restore();

	canvasCtx.save();
	canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
	if (results.landmarks) {
		for (const landmarks of results.landmarks) {
			drawing_utils.drawConnectors(canvasCtx, landmarks, HAND_CONNECTIONS, {
				color: "#00FF00",
				lineWidth: 5
			});
			drawing_utils.drawLandmarks(canvasCtx, landmarks, {
				color: "#FF0000",
				lineWidth: 2,
				radius: (x) => {
					let l = lerp(x.from.z, -0.15, .1, 10, 1);
					return Math.max(0.01, l);
				}
			});
		}

		if ((window as any).max) {
			const maxApi = (window as any).max as any;

			const maxDict = {hands: {}} as {hands: any};
			results.landmarks.forEach((l, i) => {
				const handedness = results.handedness[i];
				maxDict.hands[handedness[0].categoryName] = l;
			})
			
			maxApi.setDict("landmarks", maxDict);
			maxApi.outlet("bang");
		}
	}

	canvasCtx.restore();
  }


async function predictWebcam() {

	const displayWidth = video.clientWidth;
	const displayHeight = video.clientHeight;
	const videoWidth = video.videoWidth;
	const videoHeight = video.videoHeight;

	const intrinsicAspect = videoWidth / videoHeight;
	const displayAspect = displayWidth / displayHeight;

	let renderedWidth = 0, renderedHeight = 0;
	if (displayAspect >= intrinsicAspect) {
		renderedHeight = displayHeight;
		renderedWidth = renderedHeight * intrinsicAspect;
	} else {
		renderedWidth = Math.max(displayWidth, videoWidth);
		renderedHeight = renderedWidth / intrinsicAspect;
	}

	canvasElement.setAttribute("style", 
		`width: ${renderedWidth}px; height: ${renderedHeight}px; top: ${(displayHeight - renderedHeight) / 2}px; left: ${(displayWidth - renderedWidth) / 2}px`
	);
	
	canvasElement.width = renderedWidth;
	canvasElement.height = renderedHeight;
	
	// Now let's start detecting the stream.
	if (runningMode === "IMAGE") {
		runningMode = RunningMode.VIDEO;
		await handLandmarker.setOptions({ runningMode: "VIDEO" });
	}
	let startTimeMs = performance.now();
	if (lastVideoTime !== video.currentTime) {
		lastVideoTime = video.currentTime;
		results = handLandmarker.detectForVideo(video, startTimeMs);
	}

	onResultsHands();
	
	// Call this function again to keep predicting when the browser is ready.
	if (webcamRunning === true) {
		window.requestAnimationFrame(predictWebcam);
	}
}``