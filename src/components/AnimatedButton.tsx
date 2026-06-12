"use client";

import React, { useRef, useState } from "react";
import gsap from "gsap";
import { useGSAP } from "@gsap/react";
import { UserPlus } from "lucide-react";

interface AnimatedButtonProps {
  onClick?: () => void;
  href?: string;
  download?: boolean;
}

export default function AnimatedButton({ onClick, href, download }: AnimatedButtonProps) {
  const containerRef = useRef<HTMLButtonElement>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const tlRef = useRef<gsap.core.Timeline | null>(null);

  useGSAP(() => {
    // 1. CONFIGURACIÓN INICIAL DEL SVG
    gsap.set(".torre", { opacity: 0, y: 80 });
    gsap.set(".gota", { scale: 0, transformOrigin: "bottom center", opacity: 0 });
    gsap.set(".texto-ell", { opacity: 0, x: 40 });
    gsap.set(".texto-erf", { opacity: 0, x: -40 });
    gsap.set(".letra-w", { x: 124 });
    gsap.set(".letra-p", { x: -124 });
    gsap.set("#wellperf-svg", { xPercent: 20 });
    gsap.set(".logo-wrapper", { opacity: 0, display: "none" });

    // 2. CREAR LA LÍNEA DE TIEMPO (Pausada por defecto)
    const tl = gsap.timeline({ 
      paused: true,
      onComplete: () => {
        // Esperamos un momento y devolvemos el botón a la normalidad
        setTimeout(() => {
          setIsAnimating(false);
          // Reiniciamos los valores para la próxima vez
          gsap.set(".logo-wrapper", { opacity: 0, display: "none" });
          tl.pause(0);
        }, 1000);
      }
    });

    tl.set(".logo-wrapper", { display: "flex" })
      .fromTo(".logo-wrapper",
          { opacity: 0 },
          { opacity: 1, duration: 0.8, ease: "power2.inOut" }
      )
      .to(".letra-w", { x: 0, duration: 0.8, ease: "power4.inOut" }, "abrir")
      .to(".letra-p", { x: 0, duration: 0.8, ease: "power4.inOut" }, "abrir")
      .to("#wellperf-svg", { xPercent: 0, duration: 0.8, ease: "power4.inOut" }, "abrir")
      .to(".torre", { opacity: 1, y: 0, duration: 0.6, ease: "back.out(1.5)" }, "abrir+=0.3")
      .to(".gota", { opacity: 1, scale: 1, duration: 0.6, stagger: 0.1, ease: "elastic.out(1.5, 0.4)" }, "abrir+=0.5")
      .to(".texto-ell", { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, "abrir+=0.4")
      .to(".texto-erf", { opacity: 1, x: 0, duration: 0.6, ease: "power2.out" }, "abrir+=0.4")
      .to({}, { duration: 1.0 }) // Tiempo de lectura
      .to(".gota", { scale: 0, opacity: 0, duration: 0.2, stagger: 0.05 }, "cerrar")
      .to([".torre"], { opacity: 0, y: 30, duration: 0.4, ease: "power2.in" }, "cerrar+=0.1")
      .to(".texto-ell", { opacity: 0, x: 20, duration: 0.3 }, "cerrar+=0.1")
      .to(".texto-erf", { opacity: 0, x: -20, duration: 0.3 }, "cerrar+=0.1")
      .to(".letra-w", { x: 124, duration: 0.6, ease: "back.in(1.2)" }, "cerrar+=0.3")
      .to(".letra-p", { x: -124, duration: 0.6, ease: "back.in(1.2)" }, "cerrar+=0.3")
      .to("#wellperf-svg", { xPercent: 20, duration: 0.6, ease: "back.in(1.2)" }, "cerrar+=0.3")
      .to(".logo-wrapper", { opacity: 0, duration: 0.8, ease: "power2.inOut" }, "+=0.3");

    tlRef.current = tl;

  }, { scope: containerRef });

  const handleClick = (e?: React.MouseEvent) => {
    if (isAnimating) {
      if (href) e?.preventDefault();
      return;
    }
    
    if (onClick) onClick();
    
    setIsAnimating(true);
    // Reproducir la animación
    if (tlRef.current) {
      tlRef.current.play(0);
    }
  };

  const buttonElement = (
    <button 
      ref={containerRef}
      onClick={href ? undefined : handleClick}
      disabled={isAnimating}
      className={`w-full relative overflow-hidden rounded-2xl shadow-lg border flex flex-col items-center justify-center transition-all duration-500 min-h-[64px]
        ${isAnimating 
          ? 'bg-orange-100 border-orange-500/30 scale-100 cursor-wait' 
          : 'bg-[#d35c24] border-transparent hover:bg-orange-600 hover:scale-[1.02] active:scale-95 text-white'
        }
      `}
    >
      {/* Texto Estático - Desaparece durante la animación */}
      <div 
        className={`flex items-center justify-center gap-2 font-bold tracking-wide text-sm transition-all duration-300 absolute inset-0
          ${isAnimating ? 'opacity-0 scale-90 pointer-events-none' : 'opacity-100 scale-100'}
        `}
      >
        <UserPlus size={18} />
        GUARDAR CONTACTO
      </div>
      
      {/* SVG Animado Container - Oculto inicialmente por CSS */}
      <div className="logo-wrapper w-full h-10 hidden opacity-0 justify-center items-center pointer-events-none absolute inset-0 m-auto">
        <svg id="wellperf-svg" className="h-full w-auto" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 947.63 155.13">
          <line fill="none" strokeWidth="0" x1=".69" y1="155.13" x2="927.96" y2="155.13" />
          <g className="centro-letras">
            <path className="texto-ell" fill="#e65300" d="m341.05,121.61c-4.86,9.05-13.02,16.42-24.15,21.44-11.13,5.02-25.25,7.84-43.29,7.84-41.25,0-61.48-15.06-54.89-46.43,6.27-29.64,32.47-46.26,71.04-46.26s63.21,12.7,53.48,55.27h-86.26c-1.41,6.36,3.14,15.77,20.39,15.77,10.2,0,16.63-2.19,21.96-7.63h41.72Zm-33.25-27.51c1.26-9.25-6.43-15.06-19.92-15.06s-22.43,4.23-26.82,15.06h46.74Z" />
            <path className="texto-ell" fill="#e65300" d="m375.38,31.71h39.2l-24.61,115.86h-39.2l24.61-115.86Z" />
            <path className="texto-erf" fill="#e65300" d="m733.72,121.61c-4.86,9.05-13.02,16.42-24.15,21.44-11.13,5.02-25.25,7.84-43.29,7.84-41.25,0-61.48-15.06-54.89-46.43,6.27-29.64,32.47-46.26,71.04-46.26s63.2,12.7,53.48,55.27h-86.26c-1.41,6.36,3.14,15.77,20.39,15.77,10.2,0,16.63-2.19,21.96-7.63h41.72Zm-33.25-27.51c1.25-9.25-6.43-15.06-19.92-15.06s-22.43,4.23-26.82,15.06h46.74Z" />
            <path className="texto-erf" fill="#e65300" d="m761.61,61.94h37.95l-3.41,16.27h.28c13.03-13.34,26.99-18.83,40.49-18.83,4.24,0,8.63.31,12.71.94l-7.38,35.15c-6.59-1.73-12.08-3.14-18.99-3.14-13.97,0-29.82,4.55-33.74,23.07l-6.9,32.17h-39.17l18.16-85.64Z" />
            <path className="texto-erf" fill="#e65300" d="m876.05,86.35h-18.25l5.24-24.8h18.54l2.02-8.99c3.26-15.51,13.64-21.71,38.76-21.71,7.44,0,17.36.16,25.27.93l-4.34,20.47h-11.63c-7.13,0-9.77,2.17-10.7,6.82l-.62,2.48h21.28l-5.25,24.8h-21.18l-13,61.22h-39.15l13-61.22Z" />
          </g>
          <g className="torre">
            <polygon fill="#e65300" points="418.87 142.1 413.4 140.96 436.82 32.47 442.29 33.61 418.87 142.1" />
            <path fill="#e65300" d="m450.15,145.35l-48.74-5.36,27.97-107.89h19.25l1.52,113.25Zm-41.31-10.25l35.52,3.9.14-102.64h-10.7l-24.97,98.74Z" />
            <polygon fill="#e65300" points="404.53 137.37 403.55 133.41 441.06 124.64 411.25 101.98 442.6 88.72 422.89 60.56 443.59 43.57 446.32 46.68 428.49 61.31 448.93 90.49 419.38 102.99 450.48 126.63 404.53 137.37" />
            <polygon fill="#e65300" points="453.26 147.57 396.84 147.57 399.01 136.72 455.43 136.72 453.26 147.57" />
          </g>
          <g className="gotas-grupo">
            <path className="gota" fill="#d35c24" d="m456.65,27.51c-3.69,2.07-15.7-1.24-15.7-1.24,0,0,7.46-8.01,11.15-10.08,3.69-2.07,7.7-1.21,8.95,1.91,1.26,3.12-.72,7.33-4.4,9.4Z" />
            <path className="gota" fill="#d35c24" d="m449.11,9.33c-.89,4.56-9.85,13.86-9.85,13.86,0,0-.51-11.32.38-15.88.89-4.56,3.73-7.8,6.35-7.24,2.61.56,4.01,4.71,3.12,9.26Z" />
            <path className="gota" fill="#d35c24" d="m432.54,11.09c2.9,3.1,4.85,16.41,4.85,16.41,0,0-8.72-5.05-11.62-8.15-2.9-3.1-3.74-7.47-1.87-9.74,1.87-2.28,5.73-1.61,8.63,1.49Z" />
          </g>
          <g className="letra-w">
            <polygon fill="#e65300" points="191.52 35.59 162.58 103.79 162.27 103.79 160.55 35.59 125.36 35.59 94.39 103.79 94.07 103.79 94.23 35.59 51.41 35.59 53.48 61.94 5.03 61.94 0 85.57 55.53 85.57 60.39 147.57 103.76 147.57 132.25 85.57 132.57 85.57 134.6 147.57 178.11 147.57 234.73 35.59 191.52 35.59" />
          </g>
          <g className="letra-p">
            <path fill="#e65300" d="m574.04,35.59h-91.29l-5.61,26.35h72.71c11.19,0,14.65,3.47,12.92,11.97-1.73,8.19-6.77,11.66-17.96,11.66h-72.69l-13.2,62h44.21l7.38-34.87h47.38c31.35,0,46.24-16.61,50.78-38.09,5.33-24.92-3.29-39.03-34.64-39.03Z" />
          </g>
        </svg>
      </div>

    </button>
  );

  if (href) {
    return (
      <a href={href} download={download} onClick={handleClick} className="w-full block">
        {buttonElement}
      </a>
    );
  }

  return buttonElement;
}
