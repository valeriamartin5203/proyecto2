import React, { useEffect, useState } from 'react';

function Confetti({ active, onComplete }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (active) {
      const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff9900', '#ff66cc'];
      const newParticles = [];
      
      for (let i = 0; i < 50; i++) {
        newParticles.push({
          id: i,
          color: colors[Math.floor(Math.random() * colors.length)],
          left: Math.random() * 100,
          delay: Math.random() * 0.5,
          duration: 0.8 + Math.random() * 0.7
        });
      }
      
      setParticles(newParticles);
      
      const timer = setTimeout(() => {
        setParticles([]);
        if (onComplete) onComplete();
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [active, onComplete]);

  if (!active || particles.length === 0) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', zIndex: 9999 }}>
      {particles.map(particle => (
        <div
          key={particle.id}
          className="confetti"
          style={{
            left: `${particle.left}%`,
            top: '50%',
            backgroundColor: particle.color,
            animationDuration: `${particle.duration}s`,
            animationDelay: `${particle.delay}s`
          }}
        />
      ))}
    </div>
  );
}

export default Confetti;