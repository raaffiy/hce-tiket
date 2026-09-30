'use client';

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';

interface QRCodeImageProps {
  value: string;
  size?: number;
  className?: string;
  darkColor?: string;
  lightColor?: string;
}

export const QRCodeImage: React.FC<QRCodeImageProps> = ({
  value,
  size = 120,
  className = '',
  darkColor = '#102A43',
  lightColor = '#FFFFFF',
}) => {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    let isMounted = true;
    if (!value) return;

    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: darkColor,
        light: lightColor,
      },
    })
      .then((url) => {
        if (isMounted) setDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [value, size, darkColor, lightColor]);

  if (!dataUrl) {
    return (
      <div
        style={{ width: size, height: size }}
        className={`bg-slate-100 animate-pulse rounded-lg flex items-center justify-center border border-slate-200 ${className}`}
      >
        <span className="text-[10px] text-slate-400 font-mono">Generating QR...</span>
      </div>
    );
  }

  return (
    <img
      src={dataUrl}
      alt={`QR Code ${value}`}
      width={size}
      height={size}
      className={`rounded-lg object-contain ${className}`}
    />
  );
};

export async function generateQRCodeDataUrl(
  text: string,
  width: number = 300
): Promise<string> {
  try {
    return await QRCode.toDataURL(text, {
      width,
      margin: 1,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#102A43',
        light: '#FFFFFF',
      },
    });
  } catch (err) {
    console.error('generateQRCodeDataUrl error:', err);
    return '';
  }
}
