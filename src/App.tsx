/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Zap, 
  RefreshCcw, 
  AlertTriangle, 
  Trophy, 
  Cpu, 
  Settings,
  History,
  Radar
} from 'lucide-react';

type GameState = 'IDLE' | 'WAITING' | 'ACTION' | 'RESULT' | 'TOO_SOON';

interface ScoreRating {
  label: string;
  color: string;
  icon: JSX.Element;
}

export default function App() {
  const [gameState, setGameState] = useState<GameState>('IDLE');
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [bestScore, setBestScore] = useState<number | null>(() => {
    const saved = localStorage.getItem('neural_reflex_best');
    return saved ? parseInt(saved, 10) : null;
  });
  
  const timerRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);

  const getRating = (time: number): ScoreRating => {
    if (time <= 200) return { label: 'AI Reflex Master', color: 'text-tertiary', icon: <Cpu className="w-5 h-5" /> };
    if (time <= 350) return { label: 'Fast Thinker', color: 'text-primary', icon: <Zap className="w-5 h-5" /> };
    if (time <= 500) return { label: 'Normal Human', color: 'text-on-surface', icon: <Zap className="w-5 h-5" /> };
    return { label: 'Try Again', color: 'text-secondary', icon: <AlertTriangle className="w-5 h-5" /> };
  };

  const startGame = useCallback(() => {
    setGameState('WAITING');
    setReactionTime(null);
    
    const delay = Math.floor(Math.random() * 3000) + 2000; // 2-5 seconds
    
    timerRef.current = window.setTimeout(() => {
      setGameState('ACTION');
      startTimeRef.current = performance.now();
    }, delay);
  }, []);

  const handleClick = useCallback(() => {
    if (gameState === 'WAITING') {
      if (timerRef.current) clearTimeout(timerRef.current);
      setGameState('TOO_SOON');
    } else if (gameState === 'ACTION') {
      const endTime = performance.now();
      const time = Math.round(endTime - startTimeRef.current);
      setReactionTime(time);
      setGameState('RESULT');
      
      if (bestScore === null || time < bestScore) {
        setBestScore(time);
        localStorage.setItem('neural_reflex_best', time.toString());
      }
    }
  }, [gameState, bestScore]);

  const resetGame = useCallback(() => {
    setGameState('IDLE');
    setReactionTime(null);
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-between p-6 md:p-12 relative">
      {/* HUD - Top Bar */}
      <header className="w-full max-w-5xl flex justify-between items-center z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/10 border border-primary/30 rounded">
            <Cpu className="text-primary w-6 h-6" />
          </div>
          <h1 className="font-display font-black text-xl tracking-widest text-primary glow-cyan uppercase">
            Neural_Reflex_v1.0
          </h1>
        </div>
        <div className="flex gap-4">
          <button className="text-outline hover:text-primary transition-colors">
            <Settings className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Game Stage */}
      <main className="flex-grow flex items-center justify-center w-full max-w-4xl">
        <AnimatePresence mode="wait">
          {gameState === 'IDLE' && (
            <motion.div 
              key="idle"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              className="text-center space-y-8"
            >
              <div className="relative inline-block">
                <motion.div 
                  animate={{ opacity: [0.2, 0.5, 0.2] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="absolute inset-0 bg-primary/20 blur-3xl rounded-full"
                />
                <Radar className="w-24 h-24 text-primary relative z-10 mx-auto glow-cyan" />
              </div>
              
              <div className="space-y-4">
                <h2 className="font-display text-5xl md:text-7xl font-bold tracking-tighter uppercase">
                  AI Reaction <br/> <span className="text-primary glow-cyan">Speed Game</span>
                </h2>
                <p className="font-display text-sm tracking-[0.2em] text-outline uppercase">
                  Level: Neural Path Calibration
                </p>
              </div>

              <button 
                onClick={startGame}
                className="group relative px-12 py-4 bg-primary text-background font-display font-bold uppercase tracking-widest transition-all hover:scale-105 active:scale-95 glow-box-cyan"
                style={{ clipPath: 'polygon(0 0, 100% 0, 100% calc(100% - 15px), calc(100% - 15px) 100%, 0 100%)' }}
              >
                Initialize System
              </button>
            </motion.div>
          )}

          {(gameState === 'WAITING' || gameState === 'ACTION') && (
            <motion.div 
              key="active"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleClick}
              className={`w-full aspect-video max-h-[500px] rounded-xl border border-outline/30 flex flex-col items-center justify-center cursor-pointer transition-all duration-300 relative overflow-hidden ${
                gameState === 'WAITING' ? 'bg-surface/50 glow-box-amber' : 'bg-primary/20 border-primary shadow-[0_0_50px_rgba(0,245,255,0.3)]'
              }`}
            >
              <div className="absolute inset-0 scanline opacity-20 pointer-events-none" />
              
              <motion.div 
                animate={gameState === 'WAITING' ? { scale: [1, 1.05, 1], opacity: [0.5, 1, 0.5] } : {}}
                transition={{ duration: 1.5, repeat: Infinity }}
                className="flex flex-col items-center gap-6"
              >
                {gameState === 'WAITING' ? (
                  <>
                    <Radar className="w-16 h-16 text-on-surface-variant" />
                    <h2 className="font-display text-4xl md:text-6xl font-bold tracking-widest text-on-surface">WAIT FOR SIGNAL...</h2>
                  </>
                ) : (
                  <>
                    <Zap className="w-20 h-20 text-primary glow-cyan" />
                    <h2 className="font-display text-6xl md:text-8xl font-black tracking-widest text-primary glow-cyan animate-bounce">GO!</h2>
                  </>
                )}
              </motion.div>
            </motion.div>
          )}

          {gameState === 'RESULT' && reactionTime && (
            <motion.div 
              key="result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="w-full max-w-2xl bg-surface/80 backdrop-blur-xl border border-primary/30 rounded-xl p-8 md:p-12 text-center space-y-8 glow-box-cyan"
            >
              <div className="space-y-2">
                <p className="font-display text-xs tracking-widest text-primary uppercase">Latency Detected</p>
                <div className="flex items-baseline justify-center gap-2">
                  <h2 className="text-7xl md:text-9xl font-black glow-text-primary">{reactionTime}</h2>
                  <span className="font-display text-xl text-primary font-bold">ms</span>
                </div>
              </div>

              <div className="flex flex-col items-center gap-4">
                <div className={`inline-flex items-center gap-3 px-6 py-3 rounded border border-current bg-current/10 ${getRating(reactionTime).color}`}>
                  {getRating(reactionTime).icon}
                  <span className="font-display font-bold uppercase tracking-widest">{getRating(reactionTime).label}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-background/50 p-4 border border-outline/20 rounded">
                  <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Session Best</p>
                  <p className="font-display font-bold text-xl">{bestScore}ms</p>
                </div>
                <div className="bg-background/50 p-4 border border-outline/20 rounded">
                  <p className="text-[10px] text-outline uppercase tracking-widest mb-1">Percentile</p>
                  <p className="font-display font-bold text-xl">Top {reactionTime < 200 ? '1%' : reactionTime < 300 ? '5%' : '20%'}</p>
                </div>
              </div>

              <button 
                onClick={startGame}
                className="w-full py-4 bg-primary text-background font-display font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 transition-all"
                style={{ clipPath: 'polygon(0 0, calc(100% - 15px) 0, 100% 15px, 100% 100%, 0 100%)' }}
              >
                Restart Protocol
              </button>
            </motion.div>
          )}

          {gameState === 'TOO_SOON' && (
            <motion.div 
              key="too-soon"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-8"
            >
              <div className="bg-secondary/10 border border-secondary p-8 rounded-full inline-block">
                <AlertTriangle className="w-16 h-16 text-secondary" />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-5xl font-black text-secondary uppercase">Too Soon!</h2>
                <p className="text-outline uppercase tracking-[0.3em]">Wait for the signal next time</p>
              </div>
              <button 
                onClick={startGame}
                className="px-12 py-4 bg-secondary text-background font-display font-bold uppercase tracking-widest hover:brightness-110 transition-all"
              >
                Try Again
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Footer / Stats Bar */}
      <footer className="w-full max-w-5xl flex justify-between items-center z-50 pt-8 border-t border-outline/10 text-[10px] uppercase tracking-widest text-outline">
        <div className="flex items-center gap-4">
          <span className="text-primary/70">System_Status: Optimal</span>
          <span className="flex items-center gap-1"><History className="w-3 h-3" /> Best: {bestScore ? `${bestScore}ms` : '---'}</span>
        </div>
        <div className="hidden md:flex gap-6">
          <a href="#" className="hover:text-primary transition-colors">Leaderboard</a>
          <a href="#" className="hover:text-primary transition-colors">Neural_Logs</a>
        </div>
      </footer>
    </div>
  );
}
