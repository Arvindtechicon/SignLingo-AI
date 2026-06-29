import React, { useState } from 'react';
import { GraduationCap } from 'lucide-react';

export default function Login({ onNavigate, onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all credentials.');
      return;
    }
    setError('');
    // Store dummy token for frontend routing
    localStorage.setItem('auth_token', 'mock-jwt-token');
    onLoginSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center px-4">
      <div className="bg-white border border-slate-200/80 p-8 rounded-2xl w-full max-w-md shadow-lg shadow-indigo-500/5">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl mb-3 text-indigo-600">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Log In to SignLingo AI</h2>
          <p className="text-slate-500 text-sm mt-1">Welcome back to your learning space</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              placeholder="••••••••"
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center space-x-2 text-slate-600">
              <input type="checkbox" className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500" />
              <span>Remember me</span>
            </label>
            <button type="button" className="text-indigo-600 hover:text-indigo-700 font-medium">Forgot password?</button>
          </div>
          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm hover:shadow-md">
            Sign In
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 text-center">
          Don't have an account?{' '}
          <button onClick={() => onNavigate('register')} className="text-indigo-600 hover:text-indigo-700 font-semibold transition">
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );
}
