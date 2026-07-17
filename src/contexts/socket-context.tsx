import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/hooks/use-auth';
import { queryClient } from '@/api/queryClient';

interface SocketContextType {
  socket: Socket | null;
}

const SocketContext = createContext<SocketContextType>({ socket: null });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    if (!user) return;

    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
    const socketUrl = apiUrl.replace(/\/api$/, '');

    const socket = io(socketUrl, {
      query: { userId: user.id },
      transports: ['websocket'],
    });

    socket.on('notification', (notification) => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      const link: string = notification?.link ?? '';
      if (link.startsWith('/demands/') || link.startsWith('/comments/')) {
        queryClient.invalidateQueries({ queryKey: ['demands'] });
      }
    });

    socketRef.current = socket;

    return () => {
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket: socketRef.current }}>
      {children}
    </SocketContext.Provider>
  );
};
