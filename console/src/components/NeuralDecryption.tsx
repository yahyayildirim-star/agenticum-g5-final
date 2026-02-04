import { useState, useEffect } from 'react';

interface NeuralDecryptionProps {
  text: string;
  speed?: number;
  delay?: number;
  onComplete?: () => void;
}

const CHARS = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789$#@%&*()_+-=[]{}|;:,.<>?";

export function NeuralDecryption({ text, speed = 30, delay = 0, onComplete }: NeuralDecryptionProps) {
  const [displayText, setDisplayText] = useState('');
  const [isDecrypting, setIsDecrypting] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    
    const timeout = setTimeout(() => setIsDecrypting(true), delay);
    return () => clearTimeout(timeout);
  }, [delay]);

  useEffect(() => {
    if (!isDecrypting) return;

    let iteration = 0;
    const interval = setInterval(() => {
      setDisplayText(() => {
        return text
          .split("")
          .map((char, index) => {
            if (index < iteration) {
              return text[index];
            }
            if (char === " " || char === "\n") return char;
            return CHARS[Math.floor(Math.random() * CHARS.length)];
          })
          .join("");
      });

      if (iteration >= text.length) {
        clearInterval(interval);
        onComplete?.();
      }

      iteration += 1 / 3;
    }, speed);

    return () => clearInterval(interval);
  }, [isDecrypting, text, speed, onComplete]);

  return <>{displayText}</>;
}
