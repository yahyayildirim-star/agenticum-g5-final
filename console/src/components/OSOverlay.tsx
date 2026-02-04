import React from 'react';

export const OSOverlay: React.FC = () => {
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
        </div>
    );
};
