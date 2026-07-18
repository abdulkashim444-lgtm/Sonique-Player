/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import { activeAudioEngine } from '../utils/audioEngine';
import { VisualizerStyle } from '../types';

interface VisualizerProps {
  style: VisualizerStyle;
  themeColor: string;
  isPlaying: boolean;
}

export default function Visualizer({ style, themeColor, isPlaying }: VisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high DPI screens
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    };

    resizeCanvas();
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas();
    });
    
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Animation Loop
    const render = () => {
      const width = canvas.width / window.devicePixelRatio;
      const height = canvas.height / window.devicePixelRatio;

      // Clear with slight alpha to create motion trails
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)'; // Deep atmosphere black base
      ctx.fillRect(0, 0, width, height);

      const freqData = activeAudioEngine.getAnalyserData();
      const waveData = activeAudioEngine.getAnalyserWaveformData();

      // Check if actually playing and there is active sound
      // (sometimes freqData will be zeroes if muted or suspended)
      let sum = 0;
      for (let i = 0; i < freqData.length; i++) sum += freqData[i];
      const hasSound = sum > 0 && isPlaying;

      if (style === 'bars') {
        // --- High-tech bounce frequency bars ---
        const barWidth = (width / freqData.length) * 1.5;
        let barHeight;
        let x = 0;

        for (let i = 0; i < freqData.length; i++) {
          const val = hasSound ? freqData[i] : (Math.sin(Date.now() * 0.003 + i * 0.1) * 10 + 10);
          barHeight = (val / 255) * (height * 0.7);

          // Beautiful double-ended gradient
          const grad = ctx.createLinearGradient(0, height, 0, height - barHeight);
          grad.addColorStop(0, 'rgba(15, 23, 42, 0)');
          grad.addColorStop(0.3, themeColor + '33'); // 20% opacity
          grad.addColorStop(1, themeColor);

          ctx.fillStyle = grad;
          ctx.shadowBlur = hasSound ? val / 15 : 0;
          ctx.shadowColor = themeColor;

          ctx.fillRect(x, height - barHeight, barWidth - 2, barHeight);
          
          // Reflections
          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.fillRect(x, height - barHeight, (barWidth - 2) * 0.3, barHeight);

          x += barWidth;
        }
      } 
      else if (style === 'waves') {
        // --- Fluid glowing oscilloscope wave ---
        ctx.beginPath();
        ctx.lineWidth = 3;
        ctx.strokeStyle = themeColor;
        ctx.shadowBlur = hasSound ? 15 : 5;
        ctx.shadowColor = themeColor;

        const sliceWidth = width / waveData.length;
        let x = 0;

        for (let i = 0; i < waveData.length; i++) {
          // Normal waveData values range from 0 to 255 (128 is center)
          const val = hasSound ? waveData[i] : (Math.sin(Date.now() * 0.005 + i * 0.05) * 20 + 128);
          const v = val / 128.0;
          const y = (v * height) / 2;

          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }

          x += sliceWidth;
        }

        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Fill under the wave with subtle ambient glow
        ctx.lineTo(width, height);
        ctx.lineTo(0, height);
        const fillGrad = ctx.createLinearGradient(0, height / 2, 0, height);
        fillGrad.addColorStop(0, themeColor + '15');
        fillGrad.addColorStop(1, 'rgba(15, 23, 42, 0)');
        ctx.fillStyle = fillGrad;
        ctx.shadowBlur = 0;
        ctx.fill();
      } 
      else if (style === 'circular') {
        // --- Radial circle spectrum radiating from center ---
        const centerX = width / 2;
        const centerY = height / 2;
        const baseRadius = Math.min(width, height) * 0.22;

        ctx.shadowBlur = 0;

        // Calculate bass pulse to scale the base radius dynamically
        let bassSum = 0;
        for (let i = 0; i < 6; i++) bassSum += freqData[i];
        const bassPulse = hasSound ? (bassSum / (6 * 255)) * 25 : 0;
        const dynamicRadius = baseRadius + bassPulse;

        // Draw inner ring
        ctx.beginPath();
        ctx.arc(centerX, centerY, dynamicRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = themeColor + '40';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Draw radial frequency lines
        const numBars = 72;
        for (let i = 0; i < numBars; i++) {
          const angle = (i / numBars) * Math.PI * 2;
          // Map index to frequency array (prioritize mids/bass)
          const freqIndex = Math.floor((i < numBars / 2 ? i : numBars - i) * (freqData.length / numBars) * 0.8);
          const val = hasSound ? freqData[freqIndex] : (Math.sin(Date.now() * 0.002 + i * 0.2) * 15 + 15);
          
          const barLen = (val / 255) * (baseRadius * 0.8);

          const startX = centerX + Math.cos(angle) * dynamicRadius;
          const startY = centerY + Math.sin(angle) * dynamicRadius;
          const endX = centerX + Math.cos(angle) * (dynamicRadius + barLen);
          const endY = centerY + Math.sin(angle) * (dynamicRadius + barLen);

          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = 3;
          ctx.lineCap = 'round';
          
          // Radiating gradient stroke
          const barGrad = ctx.createLinearGradient(startX, startY, endX, endY);
          barGrad.addColorStop(0, themeColor);
          barGrad.addColorStop(1, themeColor + '20');
          ctx.strokeStyle = barGrad;
          ctx.stroke();
        }
      } 
      else if (style === 'pulse') {
        // --- Massive layered circular pulse aligned to bass ---
        const centerX = width / 2;
        const centerY = height / 2;
        const maxRadius = Math.min(width, height) * 0.45;

        // Collect sub-bass energy
        let bassSum = 0;
        const bassCount = 8;
        for (let i = 0; i < bassCount; i++) bassSum += freqData[i];
        const energy = hasSound ? (bassSum / (bassCount * 255)) : (Math.sin(Date.now() * 0.004) * 0.15 + 0.15);

        // Draw 3 layers of pulsating glowing circles
        for (let layer = 1; layer <= 3; layer++) {
          const radius = maxRadius * (layer / 3) * (0.6 + energy * 0.4);
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
          
          ctx.lineWidth = 4 - layer;
          ctx.strokeStyle = themeColor + Math.floor((0.9 - layer * 0.25) * 255).toString(16).padStart(2, '0');
          ctx.shadowBlur = hasSound ? energy * 30 : 5;
          ctx.shadowColor = themeColor;
          ctx.stroke();
        }

        // Floating musical particles pulsing with beat
        ctx.shadowBlur = 0;
        ctx.fillStyle = themeColor + 'aa';
        const numNotes = 12;
        for (let i = 0; i < numNotes; i++) {
          const angle = (i / numNotes) * Math.PI * 2 + (Date.now() * 0.0002);
          const dist = maxRadius * 0.7 * (1.0 + energy * 0.15) + Math.sin(Date.now() * 0.001 + i) * 10;
          const px = centerX + Math.cos(angle) * dist;
          const py = centerY + Math.sin(angle) * dist;
          const pSize = 3 + (i % 4) + energy * 4;

          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, 2 * Math.PI);
          ctx.fill();
        }
      }

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
      resizeObserver.disconnect();
    };
  }, [style, themeColor, isPlaying]);

  return (
    <canvas
      id="audio-visualizer-canvas"
      ref={canvasRef}
      className="w-full h-full rounded-2xl block transition-all duration-500"
    />
  );
}
