import { Fingerprint, Mail, Lock } from "lucide-react";
import { useRef, useEffect, useState } from "react";
import * as faceapi from "face-api.js";
import { supabase } from "../supabaseClient";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const videoRef = useRef(null);
  const navigate = useNavigate();
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [scanning, setScanning] = useState(false);

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = import.meta.env.BASE_URL + "models";
      console.log("Loading models from:", MODEL_URL);
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
        console.log("Models loaded successfully.");
      } catch (err) {
        console.error("Could not load AI models:", err);
      }
    };
    loadModels();
  }, []);

  const registerFaceToSupabase = async (descriptor) => {
    try {
      const descriptorArray = Array.from(descriptor);
      const { error } = await supabase
        .from("profiles")
        .upsert(
          {
            email: "archive.ref@schedulr.edu",
            face_descriptor: descriptorArray,
          },
          { onConflict: "email" },
        );
      if (error) throw error;
      alert("Face ID Registered Successfully!");
    } catch (err) {
      console.error("Registration failed:", err.message);
    }
  };

  const handleFaceScan = async () => {
    if (!modelsLoaded) return alert("AI is still warming up, please wait...");
    if (scanning) return;

    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;

        videoRef.current.onplaying = async () => {
          console.log("Video is playing, scanning for face...");

          await new Promise((res) => setTimeout(res, 500));

          const detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions(),
            )
            .withFaceLandmarks()
            .withFaceDescriptor();

          stream.getTracks().forEach((track) => track.stop());
          setScanning(false);

          if (detection) {
            console.log("Face detected!");
            const confirmReg = window.confirm(
              "Face detected! Register this to your vault?",
            );
            if (confirmReg) {
              await registerFaceToSupabase(detection.descriptor);
            } else {
              alert("Identity Verified!");
              navigate("/");
            }
          } else {
            alert("No face detected. Please try again in good lighting.");
          }
        };
      }
    } catch (err) {
      setScanning(false);
      console.error("Camera access denied or scan error:", err);
      alert("Could not access camera. Please allow camera permissions.");
    }
  };

  return (
    <div className="min-h-screen bg-[#04160e] flex flex-col items-center justify-center p-6 space-y-8 font-serif text-emerald-50">
      <video ref={videoRef} autoPlay muted playsInline className="hidden" />

      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-emerald-400 tracking-wider">
          Schedulr
        </h1>
        <p className="text-emerald-500/60 text-[10px] uppercase tracking-[0.2em]">
          Your intelligent study companion.
        </p>
      </div>

      <div className="relative flex flex-col items-center">
        <button
          onClick={handleFaceScan}
          disabled={!modelsLoaded || scanning}
          className="relative w-24 h-24 rounded-full border-2 border-[#fbbd71]/40 flex items-center justify-center bg-emerald-900/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <div className="absolute inset-0 bg-[#fbbd71]/10 animate-pulse rounded-full" />
          <Fingerprint
            size={48}
            className="text-[#fbbd71] opacity-60 absolute"
          />
          <span className="text-3xl font-bold text-[#fbbd71] relative z-10">
            S
          </span>
        </button>
        <div className="mt-6 flex flex-col items-center">
          <span className="text-[#fbbd71] text-[10px] font-sans tracking-[0.3em] font-medium uppercase">
            {!modelsLoaded
              ? "Loading AI..."
              : scanning
                ? "Scanning..."
                : "Face ID Scan"}
          </span>
          <div className="w-8 h-[1px] bg-[#fbbd71]/30 mt-1" />
        </div>
      </div>

      <div className="w-full max-w-sm bg-emerald-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
        <form
          className="space-y-5 font-sans"
          onSubmit={(e) => e.preventDefault()}
        >
          <div className="space-y-2">
            <label className="text-[10px] text-[#fbbd71]/70 uppercase tracking-widest ml-1">
              Email
            </label>
            <div className="relative">
              <Mail
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700"
              />
              <input
                type="email"
                placeholder="archive@schedulr.edu"
                className="w-full bg-[#04160e]/60 border border-emerald-900/50 rounded-xl py-3 pl-12 pr-4 text-emerald-100 placeholder:text-emerald-900 text-sm focus:outline-none focus:border-[#fbbd71]/30 transition-all"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] text-[#fbbd71]/70 uppercase tracking-widest ml-1">
              Password
            </label>
            <div className="relative">
              <Lock
                size={16}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-emerald-700"
              />
              <input
                type="password"
                placeholder="••••••••••••"
                className="w-full bg-[#04160e]/60 border border-emerald-900/50 rounded-xl py-3 pl-12 pr-4 text-emerald-100 placeholder:text-emerald-900 text-sm focus:outline-none focus:border-[#fbbd71]/30 transition-all"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-[#fbbd71] hover:bg-[#fbbd71]/90 text-[#04160e] font-bold py-4 rounded-full transition-all active:scale-[0.98] mt-4"
          >
            VERIFY IDENTITY
          </button>
        </form>
      </div>
    </div>
  );
}
