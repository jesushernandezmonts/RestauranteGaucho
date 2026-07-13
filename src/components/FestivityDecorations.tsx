import React, { useState, useEffect } from 'react';

const huamantlaColors = ['#FF4081', '#FFD740', '#1A0A2E', '#F5E6F5'];

const FestivityDecorations = () => {
  const [showMessage, setShowMessage] = useState(false);

  const handleCelebrate = () => setShowMessage(prev => !prev);
  const [particles, setParticles] = useState<React.ReactNode[]>([]);

  useEffect(() => {
    const generateParticles = () => {
      const newParticles: React.ReactNode[] = [];
      for (let i = 0; i < 20; i++) {
        const left = Math.random() * 100;
        const animationDelay = Math.random() * 2;
        const color = huamantlaColors[Math.floor(Math.random() * huamantlaColors.length)];
        const size = Math.random() * 20 + 10;
        const shape = Math.random() > 0.5 ? '50%' : '0';

        const style = {
          left: `${left}%`,
          animationDelay: `${animationDelay}s`,
          backgroundColor: color,
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: shape,
        };

        newParticles.push(
          <div style={style} className="particle">
            {Math.random() > 0.5 ? '✨' : '🍊'}
          </div>
        );
      }
      setParticles(newParticles);
    };

    generateParticles();
    const interval = setInterval(generateParticles, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="festivity-container">
      <style jsx>{`
        .festivity-container {
          background: linear-gradient(135deg, #FF6F00, #FFB300, #009688, #8BC34A);
          min-height: 100vh;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          color: #fff;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
          padding: 20px;
          position: relative;
          overflow: hidden;
        }
        .particle {
          position: absolute;
          top: -20px;
          font-size: 1.5rem;
          animation: fall linear infinite;
          animation-duration: 3s;
        }
        @keyframes fall {
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
        .decorations {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 20px;
          margin: 20px 0;
          font-size: 3rem;
        }
        .message {
          margin-top: 20px;
          font-size: 1.5rem;
          animation: fadeIn 1s ease-in;
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        button {
          padding: 12px 24px;
          font-size: 1.2rem;
          border: none;
          border-radius: 8px;
          background: #fff;
          color: #ff1493;
          cursor: pointer;
          transition: transform 0.2s;
        }
        button:hover {
          transform: scale(1.05);
        }
      `}</style>

      <div className="festivity-decorations">
        <h1>Happy Celebrations!</h1>
        <div className="decorations">
          <span role="img" aria-label="balloon">🎉</span>
          <span role="img" aria-label="confetti">🎊</span>
          <span role="img" aria-label="fireworks">🎆</span>
          <span role="img" aria-label="ribbon">🎀</span>
          <span role="img" aria-label="gift">🎁</span>
          <span role="img" aria-label="party hat">🎊</span>
          <span role="img" aria-label="tada">🎉</span>
          <span role="img" aria-label="sparkles">✨</span>
          <span role="img" aria-label="crown">👑</span>
          <span role="img" aria-label="cake">🎂</span>
        </div>
        <p>Let the celebrations begin with joy and sparkle!</p>
        <button onClick={handleCelebrate}>
          {showMessage ? 'Hide Message' : 'Join the Party'}
        </button>
        {showMessage && <div className="message">You&apos;re part of the celebration! 🎈</div>}
      </div>
    </div>
  );
};

export default FestivityDecorations;
