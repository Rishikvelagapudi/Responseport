import React from 'react';
import { Shield, ShieldAlert, ShieldCheck } from 'lucide-react';

const Logo = ({ size = 36, color = 'currentColor', className = '', type = 'default' }) => {
  if (type === 'official') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <div style={{ position: 'absolute', width: size * 1.5, height: size * 1.5, borderRadius: '50%', background: 'rgba(255, 215, 0, 0.1)', border: '1px solid rgba(255, 215, 0, 0.3)' }}></div>
        <ShieldCheck size={size} color="#FFD700" />
      </div>
    );
  }
  
  if (type === 'alert') {
    return (
      <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <ShieldAlert size={size} color="#EF4444" />
      </div>
    );
  }

  return (
    <div className={className} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Shield size={size} color={color} />
    </div>
  );
};

export default Logo;
