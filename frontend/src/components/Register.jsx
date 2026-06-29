import React, { useState } from 'react';
import { GraduationCap, Shield, User, Users, BookOpen } from 'lucide-react';

export default function Register({ onNavigate, onRegisterSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [role, setRole] = useState('Learner');
  const [error, setError] = useState('');

  const roles = [
    { id: 'Learner', name: 'Learner', desc: 'Study ASL and track your accuracy', icon: BookOpen },
    { id: 'Instructor', name: 'Instructor', desc: 'Create lessons and manage classes', icon: Users },
    { id: 'Trainer', name: 'Accessibility Trainer', desc: 'Configure system assistive guides', icon: User },
    { id: 'Admin', name: 'Admin', desc: 'Deploy system settings and audits', icon: Shield },
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email || !password || !firstName || !lastName) {
      setError('All fields are required.');
      return;
    }
    setError('');
    // Store dummy token for frontend routing
    localStorage.setItem('auth_token', 'mock-jwt-token');
    localStorage.setItem('user_role', role);
    onRegisterSuccess();
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-12 px-4">
      <div className="bg-white border border-slate-200/80 p-8 rounded-2xl w-full max-w-lg shadow-lg shadow-indigo-500/5">
        <div className="flex flex-col items-center mb-6">
          <div className="p-3 bg-indigo-50 rounded-xl mb-3 text-indigo-600">
            <GraduationCap className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">Create Your Account</h2>
          <p className="text-slate-500 text-sm mt-1">Start learning and assessing sign language today</p>
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-600 p-3 rounded-lg mb-4 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
              <input 
                type="text" 
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="John"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
              <input 
                type="text" 
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
                placeholder="Doe"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              placeholder="••••••••"
            />
          </div>

          {/* Role Selector Grid */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Select Your Role</label>
            <div className="grid grid-cols-2 gap-3">
              {roles.map((item) => {
                const Icon = item.icon;
                const isSelected = role === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setRole(item.id)}
                    className={`flex flex-col items-start p-3 text-left rounded-xl transition-all duration-200 ${
                      isSelected 
                        ? 'border-2 border-indigo-600 bg-indigo-50/30 scale-[1.02] shadow-sm' 
                        : 'border border-slate-200 bg-white hover:border-slate-300 hover:scale-[1.01]'
                    }`}
                  >
                    <div className={`p-1.5 rounded-lg mb-2 ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-600'}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="font-semibold text-sm text-slate-900">{item.name}</div>
                    <div className="text-xs text-slate-500 leading-tight mt-0.5">{item.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2.5 rounded-lg transition shadow-sm hover:shadow-md mt-2">
            Sign Up
          </button>
        </form>

        <p className="mt-6 text-sm text-slate-600 text-center">
          Already have an account?{' '}
          <button onClick={() => onNavigate('login')} className="text-indigo-600 hover:text-indigo-700 font-semibold transition">
            Log In
          </button>
        </p>
      </div>
    </div>
  );
}
