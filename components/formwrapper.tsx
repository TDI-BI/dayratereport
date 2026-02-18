import React, {useEffect, useRef, useState} from "react";
export const FormWrapper = ({
                              children,
                              errorMessage,
                            }: {
  children: React.ReactNode;
  errorMessage: string;
}) => {
  const [isFlashing, setIsFlashing] = useState(false);
  const prevErrorMessage = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (errorMessage && errorMessage !== prevErrorMessage.current) {
      setIsFlashing(false);
      const reset = setTimeout(() => setIsFlashing(true), 10);
      return () => clearTimeout(reset);
    }
    prevErrorMessage.current = errorMessage;
  }, [errorMessage]);

  return <div className="w-full max-w-[360px]">
    {/* Card Container */}
    <div className="bg-tdi-blue p-10 space-y-10 shadow">

      {/* Header with Logo */}

      <div className="flex items-center justify-between">
        <div><img
          src="https://www.tdi-bi.com/wp-content/uploads/2025/05/footer-logo.png"
          alt="TDI Logo"
          className="h-[35px] w-auto object-contain"
        />
        </div>

        {errorMessage && (
          <span
            key={errorMessage}
            className={`text-secondary/80 italic`}
          >
            {errorMessage}
          </span>
        )}
      </div>

      {/* Divider */}
      <div className="w-full h-[2px] bg-secondary"/>
      {children}
    </div>
  </div>
}