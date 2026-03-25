import React, { useRef, useEffect, useCallback } from 'react';
import { HSL, hslToHex } from '../services/colorService';

interface ColorWheelProps {
    hsl: HSL;
    onHslChange: (h: number, s: number) => void;
}

export const ColorWheel: React.FC<ColorWheelProps> = ({ hsl, onHslChange }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const size = 220;

    const drawColorWheel = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.clearRect(0, 0, size, size);

        const radius = size / 2;
        ctx.lineWidth = 2;
        
        for (let i = 0; i < 360; i += 0.5) {
            const angle = (i - 90) * Math.PI / 180;
            const gradient = ctx.createRadialGradient(radius, radius, 0, radius, radius, radius);
            gradient.addColorStop(0, 'hsl(' + i + ', 0%, 50%)');
            gradient.addColorStop(1, 'hsl(' + i + ', 100%, 50%)');
            ctx.beginPath();
            ctx.moveTo(radius, radius);
            ctx.arc(radius, radius, radius, angle, angle + (Math.PI / 180) * 0.6);
            ctx.fillStyle = gradient;
            ctx.fill();
        }
    }, [size]);
    
    useEffect(() => {
        drawColorWheel();
    }, [drawColorWheel]);
    
    const handleInteraction = (e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        
        const rect = canvas.getBoundingClientRect();
        const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
        const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
        const x = clientX - rect.left;
        const y = clientY - rect.top;

        const centerX = size / 2;
        const centerY = size / 2;
        const dx = x - centerX;
        const dy = y - centerY;
        
        const distance = Math.min(Math.sqrt(dx * dx + dy * dy), centerX);
        const angle = Math.atan2(dy, dx);
        
        const hue = (angle * 180 / Math.PI + 360 + 90) % 360;
        const saturation = (distance / centerX) * 100;

        onHslChange(hue, saturation);
    };
    
    const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
        handleInteraction(e);
        const onMouseMove = (moveE: MouseEvent) => handleInteraction(moveE as any);
        const onMouseUp = () => {
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
        };
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
    };
    
    const selectorAngle = (hsl.h - 90) * Math.PI / 180;
    const selectorRadius = (hsl.s / 100) * (size / 2);
    const selectorX = size / 2 + selectorRadius * Math.cos(selectorAngle);
    const selectorY = size / 2 + selectorRadius * Math.sin(selectorAngle);

    return (
        <div 
            className="relative w-[220px] h-[220px] mx-auto cursor-pointer"
            onMouseDown={handleMouseDown}
        >
            <canvas ref={canvasRef} width={size} height={size} className="rounded-full shadow-lg" />
            <div 
                className="absolute w-5 h-5 rounded-full border-2 border-white shadow-md pointer-events-none"
                style={{
                    left: `${selectorX - 10}px`,
                    top: `${selectorY - 10}px`,
                    backgroundColor: hslToHex(hsl),
                }}
            />
        </div>
    );
};