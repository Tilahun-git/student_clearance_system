"use client";

import {createContext,useCallback,useContext,useEffect,useRef,type ReactNode,} from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import {CLEARANCE_SOCKET_EVENT,type ClearanceRealtimePayload,
} from "@/lib/clearance/clearanceSocketIo";

type Listener = (payload: ClearanceRealtimePayload) => void;
type ClearanceRealtimeContextValue = {
  subscribe: (listener: Listener) => () => void;
};

const ClearanceRealtimeContext = createContext<ClearanceRealtimeContextValue | null>(
  null,
);

export function ClearanceRealtimeProvider({ children }: { children: ReactNode }) {
  const listenersRef = useRef(new Set<Listener>());
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const subscribe = useCallback((listener: Listener) => {
    listenersRef.current.add(listener);
    return () => listenersRef.current.delete(listener);
  }, []);

  useEffect(() => {
    const dispatch = (payload: ClearanceRealtimePayload) => {
      listenersRef.current.forEach((fn) => fn(payload));
    };

    const handleEvent = (payload: ClearanceRealtimePayload) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => dispatch(payload), 300);
    };
    socket.on(CLEARANCE_SOCKET_EVENT, handleEvent);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      socket.off(CLEARANCE_SOCKET_EVENT, handleEvent);
    };
  }, []);

  return (
    <ClearanceRealtimeContext.Provider value={{ subscribe }}>
      {children}
    </ClearanceRealtimeContext.Provider>
  );
}

function useClearanceRealtimeContext() {
  const ctx = useContext(ClearanceRealtimeContext);
  if (!ctx) {
    throw new Error("useClearanceSync must be used within ClearanceRealtimeProvider");
  }
  return ctx;
}


export function useClearanceSync(
  onUpdate: (payload: ClearanceRealtimePayload) => void,
  options: { enabled?: boolean } = {},
) {
  const { subscribe } = useClearanceRealtimeContext();
  const { data: session, status } = useSession();
  const enabled = options.enabled ?? true;
  const onUpdateRef = useRef(onUpdate);

  useEffect(() => {
    onUpdateRef.current = onUpdate;
  }, [onUpdate]);

  useEffect(() => {
    if (!enabled || status !== "authenticated") return;

    return subscribe((payload) => {
      const userId = session?.user?.id;
      if (userId && payload.triggeredByUserId === userId) return;
      onUpdateRef.current(payload);
    });
  }, [subscribe, enabled, status, session?.user?.id]);
}
