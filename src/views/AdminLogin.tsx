import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { config } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    const email = (config.adminEmail || 'admin@example.com').trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      await signInWithEmailAndPassword(auth, email, cleanPassword);
      window.location.reload();
    } catch (err: any) {
      console.error('Login error:', err);
      // If user not found or invalid credential, try auto-creating the admin account for convenience
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/operation-not-allowed') {
        try {
          await createUserWithEmailAndPassword(auth, email, cleanPassword);
          window.location.reload();
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            setError('Incorrect password. Please try again.');
          } else if (createErr.code === 'auth/operation-not-allowed') {
            setError('Email/Password authentication is disabled in Firebase Console. Please enable it in Firebase Console -> Authentication -> Sign-in method.');
          } else {
            setError(`Authentication failed [${createErr.code}]: ${createErr.message}`);
          }
          return;
        }
      }
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled in Firebase Console. Please enable it in Firebase Console -> Authentication -> Sign-in method.');
      } else {
        setError(`Login failed [${err.code || 'error'}]: ${err.message}`);
      }
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
