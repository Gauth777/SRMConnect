import React from "react";

export function BackgroundOrbs() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Orb 1: Violet/Purple */}
      <div 
        className="absolute w-[300px] h-[300px] md:w-[500px] md:h-[500px] rounded-full bg-sunset-violet/30 blur-[80px] md:blur-[120px] top-[-10%] left-[-10%] animate-float"
      />
      {/* Orb 2: Warm Orange */}
      <div 
        className="absolute w-[250px] h-[250px] md:w-[450px] md:h-[450px] rounded-full bg-sunset-orange/20 blur-[80px] md:blur-[120px] bottom-[10%] right-[-10%] animate-float-delayed"
      />
      {/* Orb 3: Golden Amber */}
      <div 
        className="absolute w-[280px] h-[280px] md:w-[400px] md:h-[400px] rounded-full bg-sunset-amber/25 blur-[70px] md:blur-[100px] top-[40%] right-[15%] animate-float-slowest"
      />
      {/* Orb 4: Deep Rust */}
      <div 
        className="absolute w-[220px] h-[220px] md:w-[350px] md:h-[350px] rounded-full bg-sunset-rust/20 blur-[60px] md:blur-[100px] bottom-[-5%] left-[20%] animate-float"
      />
    </div>
  );
}
