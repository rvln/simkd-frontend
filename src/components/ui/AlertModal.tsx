import React, { useEffect, useRef } from 'react';
import { PrimaryButton } from '@/components/ui/PrimaryButton';
import { FiAlertCircle } from 'react-icons/fi';

interface AlertModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export function AlertModal({ isOpen, onClose, title = "Perhatian", message }: AlertModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-[100] flex items-center justify-center px-4"
      onClick={(e) => {
        if (e.target === overlayRef.current) onClose();
      }}
    >
      <div className="absolute inset-0 bg-on-surface/60 backdrop-blur-sm transition-opacity" />

      <div className="relative bg-surface/95 backdrop-blur-xl rounded-2xl shadow-ambient max-w-sm w-full p-6 border border-outline-variant/10 animate-in zoom-in-95 duration-200 flex flex-col items-center text-center">
        <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <FiAlertCircle className="text-red-500 text-3xl" />
        </div>
        <h2 className="font-sans font-black text-xl text-on-surface mb-2">{title}</h2>
        <p className="font-sans text-sm text-on-surface-variant leading-relaxed mb-6">{message}</p>
        <PrimaryButton onClick={onClose} className="w-full py-3 rounded-xl font-bold tracking-wide">
          Mengerti
        </PrimaryButton>
      </div>
    </div>
  );
}
