import { useCallback, useEffect, useRef, useState } from 'react';

const ARM_MS = 2200;

export function useDoubleDelete(onDelete: (id: string) => void) {
  const [armedId, setArmedId] = useState<string | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const clearArm = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
    setArmedId(null);
  }, []);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  const onDeleteClick = useCallback(
    (id: string) => {
      if (armedId === id) {
        clearArm();
        onDelete(id);
        return;
      }
      if (timerRef.current) clearTimeout(timerRef.current);
      setArmedId(id);
      timerRef.current = setTimeout(clearArm, ARM_MS);
    },
    [armedId, clearArm, onDelete],
  );

  return { armedId, onDeleteClick, clearArm };
}
