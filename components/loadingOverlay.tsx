// /components/LoadOverlay.tsx
import {useEffect, useState} from "react";

interface LoadOverlayProps {
  message: string | null;
  children: React.ReactNode;
}

export const LoadOverlay = ({message, children}: LoadOverlayProps) => {
  const [displayMessage, setDisplayMessage] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (message) {
      setDisplayMessage(message);
      setVisible(true);
    } else {
      const fade = setTimeout(() => setVisible(false), 300);
      const clear = setTimeout(() => setDisplayMessage(null), 600);
      return () => {
        clearTimeout(fade);
        clearTimeout(clear);
      };
    }
  }, [message]);

  return (
    <div className="relative">
      {children}
      <div
        className={`absolute inset-0 flex items-center justify-center transition-opacity duration-300 ease-in-out ${
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        } bg-primary/75 text-center p-5`}
      >
        {displayMessage && (
          <span className="text-xs font-semibold uppercase tracking-widest text-secondary/80">
            {displayMessage}
          </span>
        )}
      </div>
    </div>
  );
};