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
  const [faceMode, setFaceMode] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = import.meta.env.BASE_URL + "models";
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Could not load AI models:", err);
      }
    };
    loadModels();
  }, []);

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setErrorMsg("");

    if (!email || !password) {
      setErrorMsg("Please enter your email and password.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
      navigate("/");
    } catch (err) {
      setErrorMsg(err.message || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleFaceScan = async () => {
    if (!modelsLoaded) return alert("AI is still warming up...");
    if (scanning) return;

    try {
      setScanning(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
      });

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        await new Promise((res) => setTimeout(res, 2000));

        let detection = null;
        for (let i = 0; i < 8; i++) {
          detection = await faceapi
            .detectSingleFace(
              videoRef.current,
              new faceapi.TinyFaceDetectorOptions({
                inputSize: 320,
                scoreThreshold: 0.3,
              }),
            )
            .withFaceLandmarks()
            .withFaceDescriptor();
          if (detection) break;
          await new Promise((res) => setTimeout(res, 800));
        }

        stream.getTracks().forEach((t) => t.stop());
        setScanning(false);

        if (!detection) {
          return alert(
            "No face detected.\n\n✓ Face camera directly\n✓ Improve lighting\n✓ Move 50cm away",
          );
        }

        if (faceMode === "register") {
          await registerFaceToSupabase(detection.descriptor);
        } else {
          await loginWithFace(detection.descriptor);
        }
      }
    } catch (err) {
      setScanning(false);
      alert("Camera error: " + err.message);
    }
  };

  const loginWithFace = async (descriptor) => {
    try {
      if (!email)
        return alert("Please enter your email to login with Face ID.");

      const { data, error } = await supabase
        .from("profiles")
        .select("face_descriptor")
        .eq("email", email)
        .single();

      if (error || !data?.face_descriptor) {
        return alert(
          "No Face ID registered for this email. Please register first.",
        );
      }

      const storedDescriptor = new Float32Array(data.face_descriptor);
      const distance = faceapi.euclideanDistance(descriptor, storedDescriptor); // ✅ Fixed: was liveDescriptor
      console.log("Face distance:", distance);

      if (distance < 0.6) {
        alert(`Face matched! Distance: ${distance.toFixed(3)}\nWelcome back!`);
        navigate("/");
      } else {
        alert(
          `Face not recognized. (Distance: ${distance.toFixed(3)})\nTry again or use password.`,
        );
      }
    } catch (err) {
      console.error("Face login error:", err);
      alert("Face login failed: " + err.message);
    }
  };

  const registerFaceToSupabase = async (descriptor) => {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user)
        throw new Error(
          "Not logged in. Please login with email first, then register Face ID.",
        );

      const { error } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          email: user.email,
          face_descriptor: Array.from(descriptor),
        },
        { onConflict: "email" },
      );

      if (error) throw error;
      alert("Face ID Registered!");
    } catch (err) {
      console.error("Registration failed:", err.message);
      alert("Failed: " + err.message);
    }
  };

  return (
    <div className="min-h-screen bg-[#04160e] flex flex-col items-center justify-center p-6 space-y-8 font-serif text-emerald-50">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className={scanning ? "w-48 h-36 rounded-xl mx-auto" : "hidden"}
      />
      <div className="text-center space-y-2">
        <h1 className="text-4xl font-bold text-emerald-400 tracking-wider">
          Schedulr
        </h1>
        <p className="text-emerald-500/60 text-[10px] uppercase tracking-[0.2em]">
          Your intelligent study companion.
        </p>
      </div>
      {/* Face ID Section — button + label + toggle*/}
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

        <div className="flex gap-3 mt-4">
          <button
            onClick={() => setFaceMode("login")}
            className={`text-[10px] font-sans tracking-widest uppercase px-3 py-1 rounded-full border transition-all ${
              faceMode === "login"
                ? "border-[#fbbd71] text-[#fbbd71]"
                : "border-emerald-900 text-emerald-700"
            }`}
          >
            Login
          </button>
          <button
            onClick={() => setFaceMode("register")}
            className={`text-[10px] font-sans tracking-widest uppercase px-3 py-1 rounded-full border transition-all ${
              faceMode === "register"
                ? "border-[#fbbd71] text-[#fbbd71]"
                : "border-emerald-900 text-emerald-700"
            }`}
          >
            Register
          </button>
        </div>
      </div>

      {/* Email/Password Form */}
      <div className="w-full max-w-sm bg-emerald-950/40 backdrop-blur-xl border border-white/5 rounded-3xl p-8 space-y-6">
        <form className="space-y-5 font-sans" onSubmit={handleEmailLogin}>
          {errorMsg && (
            <div className="bg-red-900/30 border border-red-500/30 rounded-xl px-4 py-3 text-red-300 text-xs">
              {errorMsg}
            </div>
          )}

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
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-[#04160e]/60 border border-emerald-900/50 rounded-xl py-3 pl-12 pr-4 text-emerald-100 placeholder:text-emerald-900 text-sm focus:outline-none focus:border-[#fbbd71]/30 transition-all"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#fbbd71] hover:bg-[#fbbd71]/90 text-[#04160e] font-bold py-4 rounded-full transition-all active:scale-[0.98] mt-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "VERIFYING..." : "VERIFY IDENTITY"}
          </button>
        </form>
      </div>
    </div>
  );
}
