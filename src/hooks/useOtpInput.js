import { useCallback, useRef, useState } from "react";

/**
 * Estado de un código OTP ingresado en casilleros de un dígito:
 * acepta solo números, avanza el foco al escribir y retrocede al borrar.
 */
export function useOtpInput(length) {
  const [digits, setDigits] = useState(() => Array(length).fill(""));
  const inputRefs = useRef([]);

  const focus = useCallback((index) => inputRefs.current[index]?.focus(), []);

  const changeDigit = useCallback((text, index) => {
    const cleaned = (text || "").replace(/[^0-9]/g, "");
    if (!cleaned) {
      setDigits((prev) => {
        const next = [...prev];
        next[index] = "";
        return next;
      });
      return;
    }

    if (cleaned.length > 1) {
      const pastedDigits = cleaned.slice(0, length - index).split("");
      setDigits((prev) => {
        const next = [...prev];
        pastedDigits.forEach((d, i) => {
          next[index + i] = d;
        });
        return next;
      });
      const nextIndex = Math.min(length - 1, index + pastedDigits.length);
      focus(nextIndex);
      return;
    }

    setDigits((prev) => {
      const next = [...prev];
      next[index] = cleaned;
      return next;
    });
    if (cleaned && index < length - 1) focus(index + 1);
  }, [focus, length]);

  const handleKeyPress = useCallback((event, index) => {
    if (event.nativeEvent.key !== "Backspace" || digits[index] || index === 0) return;
    focus(index - 1);
    setDigits((prev) => {
      const next = [...prev];
      next[index - 1] = "";
      return next;
    });
  }, [digits, focus]);

  const clear = useCallback(() => {
    setDigits(Array(length).fill(""));
    focus(0);
  }, [focus, length]);

  const registerInput = useCallback((index) => (ref) => {
    inputRefs.current[index] = ref;
  }, []);

  const code = digits.join("");

  return {
    digits,
    code,
    isComplete: code.length === length,
    changeDigit,
    handleKeyPress,
    clear,
    registerInput,
  };
}
