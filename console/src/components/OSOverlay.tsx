import React from 'react';

interface OSOverlayProps {
  systemTime: Date;
  sessionId: string;
}

export const OSOverlay: React.FC<OSOverlayProps> = ({ systemTime, sessionId }) => {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {/* Scanlines Effect */}
            <div className="absolute inset-0 opacity-[0.03]" style={{
                backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
                backgroundSize: '100% 2px, 3px 100%'
            }} />

            {/* Global Vignette */}
            <div className="absolute inset-0 shadow-[inset_0_0_150px_rgba(0,0,0,0.5)]" />

            {/* Static/Noise Texture */}
            <div className="absolute inset-0 opacity-[0.015] grayscale" style={{
                backgroundImage: 'url("https://www.transparenttextures.com/patterns/stardust.png")'
            }} />

            {/* UI Metrics */}
            <div className="absolute top-4 left-6 flex items-center gap-6 opacity-40 font-mono text-[9px] tracking-[0.2em] text-[#4285F4]">
                <div className="flex flex-col">
                    <span className="text-[7px] uppercase opacity-50">System Time</span>
                    <span>{systemTime.toLocaleTimeString()}</span>
                </div>
                <div className="h-6 w-px bg-white/10" />
                <div className="flex flex-col">
                    <span className="text-[7px] uppercase opacity-50">Neural Session</span>
                    <span className="truncate max-w-[120px]">{sessionId}</span>
                </div>
            </div>

            <div className="absolute bottom-6 right-6 opacity-30 font-mono text-[8px] tracking-widest text-[#4285F4] uppercase font-bold">
                Antigravity OS v5.2.1-FIXED • Substrate: Google Stack Core
            </div>
        </div>
    );
};
