import {
  createContext,
  useContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react';

interface ToastItem {
  id: string;
  kind: 'ok' | 'err';
  title: string;
  body?: string;
}

interface ToastCtx {
  add: (t: Omit<ToastItem, 'id'>) => void;
}

const Ctx = createContext<ToastCtx>({ add: () => {} });

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const add = useCallback((t: Omit<ToastItem, 'id'>) => {
    const id = Math.random().toString(36).slice(2);
    setToasts((prev) => [...prev, { ...t, id }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((x) => x.id !== id)),
      4000,
    );
  }, []);

  return (
    <Ctx.Provider value={{ add }}>
      {children}
      <div className="vd-toasts">
        {toasts.map((t) => (
          <div key={t.id} className={`vd-toast vd-toast--${t.kind}`}>
            <span className="vd-toast__dot" />
            <div>
              <div className="vd-toast__t">{t.title}</div>
              {t.body && <div className="vd-toast__d">{t.body}</div>}
            </div>
          </div>
        ))}
      </div>
    </Ctx.Provider>
  );
}

export function useToast() {
  return useContext(Ctx);
}
