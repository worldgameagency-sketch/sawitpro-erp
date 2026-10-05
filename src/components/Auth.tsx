import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';

export function Auth() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [message, setMessage] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    if (!supabase) {
      setMessage('Supabase belum dikonfigurasi!');
      setLoading(false);
      return;
    }

    if (isSignUp) {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        setMessage('Pendaftaran berhasil! Silakan cek email untuk verifikasi atau langsung login.');
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-xl shadow-lg border border-gray-700">
        <h2 className="text-2xl font-bold text-center mb-2 text-green-400">SawitPro ERP</h2>
        <p className="text-sm text-gray-400 text-center mb-6">
          {isSignUp ? 'Daftar Akun Baru Mandor/Pemilik' : 'Silakan Login ke Akun Kebun'}
        </p>

        {message && (
          <div className="mb-4 p-3 bg-gray-700 text-sm rounded border border-gray-600 text-yellow-300">
            {message}
          </div>
        )}

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-green-500"
              placeholder="contoh@kebun.com"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase text-gray-400 mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white focus:outline-none focus:border-green-500"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-green-600 hover:bg-green-500 text-white font-bold rounded transition duration-200"
          >
            {loading ? 'Memproses...' : isSignUp ? 'Daftar' : 'Login'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-sm text-green-400 hover:underline focus:outline-none"
          >
            {isSignUp ? 'Sudah punya akun? Login di sini' : 'Belum punya akun? Daftar sekarang'}
          </button>
        </div>
      </div>
    </div>
  );
}