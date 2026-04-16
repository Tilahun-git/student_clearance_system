"use client";

import { useSocketNotifications} from '@/hooks/useSocketNotifications'
export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocketNotifications();

  return <>{children}</>;
}