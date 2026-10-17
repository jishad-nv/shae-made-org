import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { auth } from '../firebase';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';

export const AdminLogin: React.FC = () => {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { config } = useStore();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter your admin password');
      return;
    }
    setError('');
    setLoading(true);
    const email = (config.adminEmail || 'admin@example.com').trim().toLowerCase();
    const cleanPassword = password.trim();

    try {
      await signInWithEmailAndPassword(auth, email, cleanPassword);
      // onAuthStateChanged in App.tsx / StoreContext will automatically handle the transition
    } catch (err: any) {
      console.warn('Login attempt result code:', err.code);
      // If user not found or invalid credential, try auto-creating the admin account for convenience
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          await createUserWithEmailAndPassword(auth, email, cleanPassword);
          return;
        } catch (createErr: any) {
          if (createErr.code === 'auth/email-already-in-use') {
            setError('Incorrect password. Please try again.');
          } else if (createErr.code === 'auth/operation-not-allowed') {
            setError('Email/Password authentication is disabled in Firebase Console.');
          } else if (createErr.code === 'auth/weak-password') {
            setError('Password should be at least 6 characters.');
          } else {
            setError(`Authentication failed [${createErr.code}]: ${createErr.message}`);
          }
          return;
        }
      }
      if (err.code === 'auth/operation-not-allowed') {
        setError('Email/Password authentication is disabled in Firebase Console.');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError(`Login failed: ${err.message || err.code}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#fcf9f4] p-4">
      <form onSubmit={handleLogin} className="p-7 sm:p-8 bg-white rounded-2xl shadow-sm border border-[#eee7dc] w-full max-w-sm space-y-4">
        <div>
          <span className="text-[10px] font-bold text-[#59684c] uppercase tracking-wider">Shae.made Studio</span>
          <h2 className="font-luxury-serif text-2xl font-bold text-[#2b352a]">Admin Login</h2>
          <p className="text-xs text-[#737c6e] mt-1">Enter your password to access the store management panel.</p>
        </div>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl">
            {error}
          </div>
        )}

        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter admin password"
            disabled={loading}
            className="w-full px-4 py-2.5 rounded-xl border border-[#eee7dc] focus:border-[#59684c] focus:outline-none text-xs text-[#2b352a] bg-[#fcf9f4]"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full btn-primary py-2.5 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
        >
          {loading ? (
            <>
              <span className="material-icon text-sm animate-spin">sync</span>
              <span>Verifying...</span>
            </>
          ) : (
            <span>Log In to Admin</span>
          )}
        </button>
      </form>
    </div>
  );
};
