import React from 'react';
import { Camera, BookOpen, GraduationCap, ShieldCheck } from 'lucide-react';

export default function LandingPage({ onNavigate }) {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col justify-between">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 py-4 px-6 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <span className="text-xl font-bold tracking-tight text-slate-900">SignLingo AI</span>
          </div>
          <div className="space-x-4">
            <button onClick={() => onNavigate('login')} className="text-slate-600 hover:text-indigo-600 px-3 py-2 text-sm font-medium transition">
              Log In
            </button>
            <button onClick={() => onNavigate('register')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm hover:shadow-md">
              Register
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-6 py-16 flex-grow flex flex-col justify-center items-center text-center">
        <div className="inline-flex items-center space-x-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2.5 h-2.5 bg-indigo-600 rounded-full animate-pulse"></span>
          <span className="text-xs font-semibold text-indigo-800">AI Gesture Recognition Active</span>
        </div>
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight max-w-3xl leading-tight text-slate-900">
          Master American Sign Language with <span className="bg-gradient-to-r from-indigo-600 to-violet-600 bg-clip-text text-transparent">Real-Time AI Feedback</span>
        </h1>
        <p className="mt-6 text-lg text-slate-600 max-w-2xl">
          Learn standard ASL expressions, interactive letters, and full words using your webcam. Track accuracy and track milestones step by step.
        </p>
        <div className="mt-10 flex space-x-4">
          <button onClick={() => onNavigate('register')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-3 rounded-lg font-semibold text-base transition shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20">
            Get Started Free
          </button>
          <button className="border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 px-8 py-3 rounded-lg font-semibold text-base transition shadow-sm">
            Watch Demo
          </button>
        </div>

        {/* Features grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-5xl">
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm text-left">
            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <Camera className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Real-time Recognition</h3>
            <p className="mt-2 text-sm text-slate-600">Instant AI model classification checking your hand postures and gestures via standard webcam.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm text-left">
            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <BookOpen className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Structured Lessons</h3>
            <p className="mt-2 text-sm text-slate-600">Step-by-step interactive lessons covering letters, numbers, and vocabulary lists.</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-slate-200/60 shadow-sm text-left">
            <div className="h-12 w-12 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-600 mb-4">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">Automated Assessments</h3>
            <p className="mt-2 text-sm text-slate-600">Run through official assessment levels to score points and measure exact performance metrics.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-6 text-center text-sm text-slate-500 bg-white">
        <p>&copy; 2026 SignLingo AI Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
