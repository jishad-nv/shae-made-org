import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { config } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const email = (config.adminEmail || 'admin@example.com').trim().toLowerCase();
      await signInWithEmailAndPassword(auth, email, password.trim());
      window.location.reload(); // Reload to check auth status
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Login failed: ${err.code || err.message}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f4]">
      <form onSubmit={handleLogin} className="p-8 bg-white rounded-2xl shadow-sm border border-[#eee7dc] w-full max-w-sm">
        <h2 className="font-luxury-serif text-2xl font-bold mb-6 text-[#2b352a]">Admin Login</h2>
        {error && <p className="text-red-500 text-xs mb-4">{error}</p>}
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Enter password"
          className="w-full px-4 py-2 mb-4 rounded-xl border border-[#eee7dc] focus:border-[#59684c] focus:outline-none"
        />
        <button type="submit" className="w-full btn-primary py-2 rounded-xl">Login</button>
      </form>
    </div>
  );
};
