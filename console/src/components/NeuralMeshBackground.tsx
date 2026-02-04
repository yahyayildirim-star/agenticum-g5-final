import React, { useEffect, useRef } from 'react';
import type { SystemTelemetry } from './TelemetryDashboard';

class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;

    constructor(w: number, h: number, speedMult: number) {
        this.x = Math.random() * w;
        this.y = Math.random() * h;
        this.vx = (Math.random() - 0.5) * 0.5 * speedMult;
        this.vy = (Math.random() - 0.5) * 0.5 * speedMult;
        this.size = Math.random() * 1.5 + 0.5;
    }

    update(w: number, h: number) {
        this.x += this.vx;
        this.y += this.vy;

        if (this.x < 0 || this.x > w) this.vx *= -1;
        if (this.y < 0 || this.y > h) this.vy *= -1;
    }

    draw(ctx: CanvasRenderingContext2D) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(66, 133, 244, 0.4)';
        ctx.fill();
    }
}

export const NeuralMeshBackground: React.FC<{ stats?: SystemTelemetry }> = ({ stats }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let animationFrameId: number;
        let particles: Particle[] = [];
        
        // Dynamic properties based on stats (LOD Scaling)
        const cpuUsage = stats?.cpuLatency ? Math.min(parseFloat(stats.cpuLatency) / 50, 1) : 0;
        const gpuUsage = stats?.gpuMemory ? Math.min(parseFloat(stats.gpuMemory) / 24, 1) : 0;
        
        // High Load = Fewer particles/lines for performance
        const isHighLoad = cpuUsage > 0.8 || gpuUsage > 0.8;
        const particleCount = isHighLoad ? 30 : 60 + Math.floor(gpuUsage * 40);
        const maxDistance = isHighLoad ? 80 : 120 + (cpuUsage * 80);
        const speedMult = 1 + (cpuUsage * 2);

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            init();
        };

        const init = () => {
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle(canvas.width, canvas.height, speedMult));
            }
        };

        const drawLines = () => {
            ctx.lineWidth = 0.5;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < maxDistance) {
                        ctx.beginPath();
                        ctx.strokeStyle = `rgba(66, 133, 244, ${0.12 * (1 - distance / maxDistance)})`;
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.stroke();
                    }
                }
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => {
                p.update(canvas.width, canvas.height);
                p.draw(ctx);
            });
            drawLines();
            animationFrameId = requestAnimationFrame(animate);
        };

        window.addEventListener('resize', resize);
        resize();
        animate();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, [stats]);

    return (
        <canvas 
            ref={canvasRef} 
            className="fixed inset-0 pointer-events-none z-0 opacity-60"
            style={{ 
                filter: 'blur(1px)',
                background: 'radial-gradient(circle at 50% 50%, #0a0e14 0%, #030508 100%)'
            }}
        />
    );
};
