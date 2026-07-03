import React, { useRef, useEffect, useState } from 'react';
import Webcam from 'react-webcam';
import { Hands } from '@mediapipe/hands';
import { Pose } from '@mediapipe/pose';


const HAND_CONNECTIONS = [
  [0, 1], [1, 2], [2, 3], [3, 4],     // Thumb
  [0, 5], [5, 6], [6, 7], [7, 8],     // Index
  [9, 10], [10, 11], [11, 12],        // Middle
  [13, 14], [14, 15], [15, 16],       // Ring
  [0, 17], [17, 18], [18, 19], [19, 20], // Pinky
  [5, 9], [9, 13], [13, 17]           // Palm base
];

export const CameraFeed = ({ userId = '1', signId = 'A', onAssessmentCompleted }) => {
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const socketRef = useRef(null);
  
  const [isConnected, setIsConnected] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('Initializing camera...');
  const [accuracy, setAccuracy] = useState(0);
  const [resultData, setResultData] = useState(null);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);

  const latestHandsRef = useRef(null);
  const latestPoseRef = useRef(null);


  // Sync state reference to use inside callbacks without re-triggering effects
  const isRecordingRef = useRef(isRecording);
  useEffect(() => {
    isRecordingRef.current = isRecording;
  }, [isRecording]);

  // Handle WebSocket Connection
  useEffect(() => {
    const wsUrl = `ws://localhost:8000/api/v1/gestures/ws/${userId}/${signId}`;
    const ws = new WebSocket(wsUrl);
    socketRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      setFeedbackMessage('Ready to practice. Press "Record Attempt" to start.');
    };
    ws.onclose = () => {
      setIsConnected(false);
      setFeedbackMessage('WebSocket disconnected. Reconnecting...');
    };
    ws.onerror = () => {
      setFeedbackMessage('WebSocket connection error.');
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'ASSESSMENT_RESULT') {
        const payload = data.payload;
        setAccuracy(Math.round(payload.score));
        setResultData(payload);
        onAssessmentCompleted(payload);
        setIsRecording(false);
        setFeedbackMessage('Assessment completed.');
      } else if (data.type === 'ERROR') {
        setFeedbackMessage(`Error: ${data.payload}`);
        setIsRecording(false);
      }
    };

    return () => {
      ws.close();
    };
  }, [userId, signId, onAssessmentCompleted]);

  // Handle MediaPipe Initialization and requestAnimationFrame loop
  useEffect(() => {
    if (!isCameraEnabled || !webcamRef.current) return;

    try {
      const hands = new Hands({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });


      const pose = new Pose({
        locateFile: (file) => `https://cdn.jsdelivr.net/npm/@mediapipe/pose/${file}`,
      });

      pose.setOptions({
        modelComplexity: 1,
        smoothLandmarks: true,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results) => {
        latestHandsRef.current = results.multiHandLandmarks || null;
        redrawCanvas();
        sendLandmarks(results);
      });

      pose.onResults((results) => {
        latestPoseRef.current = results.poseLandmarks || null;
        redrawCanvas();
      });

      let active = true;
      const processVideo = async () => {
        if (!active) return;
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4) {
          const video = webcamRef.current.video;
          try {
            // Sequential execution prevents WebAssembly concurrent clashing
            await hands.send({ image: video });
            await pose.send({ image: video });
          } catch (e) {
            console.error('MediaPipe processing error:', e);
            setFeedbackMessage(`Processing error: ${e.message || e}`);
          }
        }
        requestAnimationFrame(processVideo);
      };

      processVideo();

      return () => {
        active = false;
      };
    } catch (err) {
      console.error('CameraFeed Init Error:', err);
      setFeedbackMessage(`Camera Init Error: ${err.message || err}`);
    }
  }, [isCameraEnabled]);


  const redrawCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw reference bounding box
    ctx.strokeStyle = 'rgba(79, 70, 229, 0.2)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(100, 60, 440, 360);
    ctx.setLineDash([]);

    // 1. Draw Pose Landmarks (Shoulders, Elbows, Wrists)
    const poseLandmarks = latestPoseRef.current;
    if (poseLandmarks) {
      const poseConnections = [
        [11, 12], // Left shoulder to Right shoulder
        [11, 13], // Left shoulder to Left elbow
        [12, 14], // Right shoulder to Right elbow
        [13, 15], // Left elbow to Left wrist
        [14, 16], // Right elbow to Right wrist
      ];

      ctx.strokeStyle = 'rgba(99, 102, 241, 0.6)'; // Violet lines for body arms/shoulders
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      for (const [startIdx, endIdx] of poseConnections) {
        const startPt = poseLandmarks[startIdx];
        const endPt = poseLandmarks[endIdx];
        if (startPt && endPt) {
          ctx.beginPath();
          ctx.moveTo((1 - startPt.x) * canvas.width, startPt.y * canvas.height);
          ctx.lineTo((1 - endPt.x) * canvas.width, endPt.y * canvas.height);
          ctx.stroke();
        }
      }

      const trackJoints = [11, 12, 13, 14, 15, 16];
      for (const idx of trackJoints) {
        const pt = poseLandmarks[idx];
        if (pt) {
          ctx.beginPath();
          ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, 6, 0, 2 * Math.PI);
          ctx.fillStyle = '#6366F1'; // Violet joints
          ctx.fill();
        }
      }
    }

    // 2. Draw Hand Landmarks
    const handLandmarks = latestHandsRef.current;
    if (handLandmarks) {
      for (const landmarks of handLandmarks) {
        // Draw cobalt-blue skeleton lines
        ctx.strokeStyle = '#2563EB'; // Cobalt Blue
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        for (const [startIdx, endIdx] of HAND_CONNECTIONS) {
          const startPt = landmarks[startIdx];
          const endPt = landmarks[endIdx];
          if (startPt && endPt) {
            ctx.beginPath();
            ctx.moveTo((1 - startPt.x) * canvas.width, startPt.y * canvas.height);
            ctx.lineTo((1 - endPt.x) * canvas.width, endPt.y * canvas.height);
            ctx.stroke();
          }
        }

        // Draw emerald-green joints
        for (const pt of landmarks) {
          ctx.beginPath();
          ctx.arc((1 - pt.x) * canvas.width, pt.y * canvas.height, 5, 0, 2 * Math.PI);
          ctx.fillStyle = '#10B981'; // Emerald Green
          ctx.fill();
        }
      }
    }
  };


  const sendLandmarks = (results) => {
    if (!isRecordingRef.current || !socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    const payload = {
      timestamp: Date.now(),
      hands: results.multiHandLandmarks ? results.multiHandLandmarks.map((hl, idx) => ({
        hand_label: results.multiHandedness[idx] ? results.multiHandedness[idx].label : 'Unknown',
        points: hl.map(pt => ({ x: pt.x, y: pt.y, z: pt.z }))
      })) : [],
      pose: latestPoseRef.current ? latestPoseRef.current.map(pt => ({ x: pt.x, y: pt.y, z: pt.z })) : []
    };

    socketRef.current.send(JSON.stringify({ type: 'FRAME', data: payload }));
  };




  const handleStartRecording = () => {
    setResultData(null);
    setAccuracy(0);
    setIsRecording(true);
    setFeedbackMessage('Recording... Perform sign inside box.');
  };

  const handleStopRecording = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'STOP_RECORDING' }));
      setFeedbackMessage('Processing attempt results...');
    }
  };

  return (
    <div className="flex flex-col space-y-6">
      {/* HUD Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200/80 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-4">
          {/* Accuracy Circular Gauge */}
          <div className="relative h-16 w-16 shrink-0">
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="32"
                cy="32"
                r="28"
                className="text-slate-100"
                strokeWidth="4"
                stroke="currentColor"
                fill="transparent"
              />
              <circle
                cx="32"
                cy="32"
                r="28"
                className="text-emerald-600 transition-all duration-500 ease-out"
                strokeWidth="4"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 * (1 - accuracy / 100)}
                strokeLinecap="round"
                stroke="currentColor"
                fill="transparent"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center text-sm font-bold text-slate-800">
              {accuracy}%
            </div>
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Accuracy HUD</h4>
            <div className="flex items-center space-x-2 mt-1">
              <span className={`h-2.5 w-2.5 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-slate-400 animate-pulse'}`}></span>
              <span className="text-xs text-slate-500 font-semibold uppercase tracking-wider">
                {isConnected ? 'WebSocket Stream Connected' : 'Offline'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Buttons / Controls */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsCameraEnabled(!isCameraEnabled)}
            className={`px-5 py-2.5 rounded-xl font-semibold shadow-sm transition-all text-sm flex items-center gap-2 border ${
              isCameraEnabled 
                ? 'bg-white hover:bg-slate-50 text-slate-700 border-slate-200' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white border-transparent'
            }`}
          >
            {isCameraEnabled ? 'Disable Camera' : 'Enable Camera'}
          </button>

          <button
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            disabled={!isConnected || !isCameraEnabled}
            className={`px-5 py-2.5 rounded-xl font-semibold text-white shadow-sm transition-all text-sm flex items-center gap-2 ${
              isRecording 
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200' 
                : 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {isRecording ? (
              <>
                <span className="h-2 w-2 rounded-full bg-white animate-ping"></span>
                <span>Analyze Sign</span>
              </>
            ) : (
              <span>Record Attempt</span>
            )}
          </button>
        </div>

      </div>

      {/* Video Feed Panel */}
      {isCameraEnabled ? (
        <div className="relative w-full aspect-[4/3] max-w-[640px] bg-slate-950 rounded-2xl overflow-hidden shadow-md mx-auto border border-slate-200/80 animate-fade-in">
          <Webcam
            ref={webcamRef}
            className="absolute top-0 left-0 w-full h-full object-cover"
            mirrored
            audio={false}
            screenshotFormat="image/jpeg"
          />
          <canvas
            ref={canvasRef}
            width={640}
            height={480}
            className="absolute top-0 left-0 w-full h-full pointer-events-none"
          />
        </div>
      ) : (
        <div className="relative w-full aspect-[4/3] max-w-[640px] bg-slate-100 rounded-2xl overflow-hidden shadow-sm mx-auto border border-slate-200 flex flex-col items-center justify-center text-slate-400">
          <div className="p-4 bg-slate-200 rounded-full text-slate-500 mb-3">
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10.66 6H14a2 2 0 0 1 2 2v3.34"/><path d="M17 11l5-3v8l-.19-.12"/><path d="M2 2l20 20"/><path d="M19 13.58V8"/><path d="M8.2 8H4a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h11.8"/></svg>
          </div>
          <p className="text-base font-semibold text-slate-700">Webcam is disabled</p>
          <p className="text-xs text-slate-400 mt-1">Press "Enable Camera" above to start hand tracking.</p>
        </div>
      )}


      {/* Status Alert Banner */}
      <div className={`p-4 rounded-xl border text-sm transition-all duration-300 ${
        resultData
          ? resultData.is_correct
            ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
            : 'bg-amber-50 border-amber-200 text-amber-800'
          : 'bg-slate-50 border-slate-200 text-slate-600'
      }`}>
        <div className="font-bold mb-1">
          {resultData 
            ? resultData.is_correct 
              ? '✓ Perfect Shape Matching!' 
              : '⚠ Keep Adjusting Your Pose'
            : 'Current Status'}
        </div>
        <div>{feedbackMessage}</div>
        {resultData && resultData.feedback && (
          <div className="mt-2 font-medium text-xs border-t border-current/10 pt-2">
            Detailed Correction: {resultData.feedback}
          </div>
        )}
      </div>
    </div>
  );
};
