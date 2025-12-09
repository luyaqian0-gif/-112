import React, { useState, useEffect, useRef } from 'react';
import * as THREE from 'three';
import { ChristmasScene } from './components/ChristmasScene';
import { VisionService } from './services/visionService';

const App: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [uiHidden, setUiHidden] = useState(false);
  const [visionReady, setVisionReady] = useState(false);
  const [uploadedTexture, setUploadedTexture] = useState<THREE.Texture | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const initVision = async () => {
      try {
        await VisionService.getInstance().initialize();
        
        // Start Camera
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
          videoRef.current.addEventListener('loadeddata', () => {
             setVisionReady(true);
          });
        }
      } catch (err) {
        console.error("Camera/Vision Init Failed:", err);
        // Continue loading app even if vision fails, just without gestures
        setLoading(false); 
      }
    };

    initVision();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === 'h') {
        setUiHidden(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          new THREE.TextureLoader().load(ev.target.result as string, (t) => {
            t.colorSpace = THREE.SRGBColorSpace;
            setUploadedTexture(t);
          });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black text-[#d4af37] font-['Cinzel'] selection:bg-[#d4af37] selection:text-black">
      
      {/* 3D Scene Layer */}
      <ChristmasScene 
        videoRef={videoRef}
        isVisionReady={visionReady}
        onLoaded={() => setTimeout(() => setLoading(false), 1000)} // Artificial delay for smooth transition
        uploadedTexture={uploadedTexture}
      />

      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-black transition-opacity duration-1000">
          <div className="w-10 h-10 border-t-2 border-[#d4af37] rounded-full animate-spin mb-4" />
          <p className="text-sm tracking-widest text-[#d4af37] animate-pulse font-['Times_New_Roman']">LOADING HOLIDAY MAGIC</p>
        </div>
      )}

      {/* Main UI Overlay */}
      <div className={`absolute inset-0 z-10 pointer-events-none ui-fade ${uiHidden ? 'ui-hidden' : ''}`}>
        
        {/* Title */}
        <div className="absolute top-8 left-0 right-0 text-center">
          <h1 className="text-5xl md:text-[56px] font-bold tracking-wider drop-shadow-[0_0_10px_rgba(212,175,55,0.8)]"
              style={{ background: 'linear-gradient(to bottom, #ffffff, #d4af37)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Merry Christmas
          </h1>
        </div>

        {/* Controls - Bottom Center */}
        <div className="absolute bottom-20 left-0 right-0 flex flex-col items-center pointer-events-auto">
          <div className="relative group upload-wrapper">
             <input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
             />
             <button className="px-8 py-3 bg-black/30 backdrop-blur-md border border-[#d4af37] text-[#d4af37] font-bold tracking-widest uppercase hover:bg-[#d4af37] hover:text-black transition-all duration-300 shadow-[0_0_15px_rgba(212,175,55,0.3)]">
                Add Memories
             </button>
          </div>
          <p className="mt-4 text-xs font-['Times_New_Roman'] text-[#fceea7]/70 tracking-widest">
            PRESS 'H' TO HIDE CONTROLS
          </p>
          <div className="mt-2 text-[10px] font-['Times_New_Roman'] text-[#fceea7]/50 tracking-wider">
             GESTURES: FIST (TREE) • OPEN (SCATTER) • PINCH (FOCUS)
          </div>
        </div>

      </div>

      {/* Hidden Webcam for CV */}
      <div className="absolute bottom-4 right-4 w-[160px] h-[120px] opacity-0 pointer-events-none overflow-hidden border border-[#d4af37]">
         <video 
            ref={videoRef} 
            className="w-full h-full object-cover transform -scale-x-100" // Mirror for better UX
            muted 
            playsInline
         />
      </div>

    </div>
  );
};

export default App;
