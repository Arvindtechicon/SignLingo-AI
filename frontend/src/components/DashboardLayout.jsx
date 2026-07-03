import React, { useState } from 'react';
import { CameraFeed } from './CameraFeed';

import { 
  LayoutDashboard, 
  BookOpen, 
  Camera, 
  Settings, 
  LogOut, 
  User, 
  BellRing,
  Menu,
  X,
  Target,
  Award,
  BookMarked
} from 'lucide-react';

export default function DashboardLayout({ onLogout }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [selectedSign, setSelectedSign] = useState('A');


  // Profile Settings States
  const [firstName, setFirstName] = useState('User');
  const [lastName, setLastName] = useState('Name');
  const [bio, setBio] = useState('ASL Learner pursuing fluency.');
  const [skillLevel, setSkillLevel] = useState('Beginner'); // Beginner, Intermediate, Advanced
  const [targetHours, setTargetHours] = useState(5);
  const [learningGoals, setLearningGoals] = useState(['Daily Conversation']); // toggle list

  const goalsOptions = [
    { id: 'Daily Conversation', label: 'Daily Conversation', icon: BookMarked },
    { id: 'Career Advancement', label: 'Career Advancement', icon: Target },
    { id: 'Academic Learning', label: 'Academic Learning', icon: Award },
    { id: 'Personal Interest', label: 'Personal Interest', icon: BookOpen }
  ];

  const handleGoalToggle = (goalId) => {
    if (learningGoals.includes(goalId)) {
      setLearningGoals(learningGoals.filter(g => g !== goalId));
    } else {
      setLearningGoals([...learningGoals, goalId]);
    }
  };

  const navigation = [
    { name: 'Dashboard', icon: LayoutDashboard, id: 'dashboard' },
    { name: 'Lessons', icon: BookOpen, id: 'lessons' },
    { name: 'Practice Sandbox', icon: Camera, id: 'sandbox' },
    { name: 'Profile Settings', icon: User, id: 'profile' },
    { name: 'Settings', icon: Settings, id: 'settings' },
  ];

  const handleProfileSave = (e) => {
    e.preventDefault();
    alert('Profile updated successfully!');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-800 font-sans">
      
      {/* Sidebar for Desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-slate-50 border-r border-slate-200/80 p-4 shrink-0">
        <div className="flex items-center space-x-2 px-2 py-4 mb-6">
          <div className="p-1.5 bg-indigo-100 rounded-lg text-indigo-600">
            <Camera className="h-6 w-6" />
          </div>
          <span className="text-xl font-bold tracking-tight text-slate-900">SignLingo AI</span>
        </div>
        
        <nav className="flex-1 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 relative ${
                  isActive 
                    ? 'bg-white text-indigo-600 font-semibold shadow-sm border border-slate-200/40' 
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-indigo-600 rounded-r-md"></span>
                )}
                <Icon className={`h-5 w-5 ${isActive ? 'text-indigo-600' : 'text-slate-500'}`} />
                <span>{item.name}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-slate-200 pt-4">
          <button 
            onClick={onLogout}
            className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition-all"
          >
            <LogOut className="h-5 w-5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden bg-slate-900/40 backdrop-blur-sm">
          <aside className="w-64 bg-white border-r border-slate-200 p-4 flex flex-col">
            <div className="flex items-center justify-between px-2 py-4 mb-6">
              <span className="text-xl font-bold tracking-tight text-slate-900">SignLingo AI</span>
              <button onClick={() => setSidebarOpen(false)} className="text-slate-500 hover:text-slate-900">
                <X className="h-6 w-6" />
              </button>
            </div>
            <nav className="flex-1 space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                      isActive 
                        ? 'bg-indigo-50 text-indigo-600 font-semibold' 
                        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
            <div className="border-t border-slate-200 pt-4">
              <button 
                onClick={onLogout}
                className="w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 hover:bg-rose-50 hover:text-rose-700 transition"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-grow flex flex-col min-w-0 bg-slate-50">
        
        {/* Navbar */}
        <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
          <div className="flex items-center">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="md:hidden text-slate-500 hover:text-slate-900 mr-4"
            >
              <Menu className="h-6 w-6" />
            </button>
            <h1 className="text-lg font-semibold text-slate-800 capitalize">
              {navigation.find(n => n.id === activeTab)?.name || activeTab}
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <button className="text-slate-500 hover:text-slate-900 relative p-1.5 rounded-full hover:bg-slate-100 transition">
              <BellRing className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2.5 w-2.5 bg-rose-500 rounded-full ring-2 ring-white"></span>
            </button>
            <div className="flex items-center space-x-2">
              <div className="h-8 w-8 bg-gradient-to-tr from-indigo-600 to-violet-600 rounded-full flex items-center justify-center font-bold text-white shadow-sm text-sm">
                {firstName[0] || 'U'}
              </div>
              <span className="hidden sm:inline text-sm font-medium text-slate-700">{firstName}</span>
            </div>
          </div>
        </header>

        {/* Content Shell */}
        <main className="flex-grow p-4 md:p-8 max-w-5xl w-full mx-auto">
          {activeTab === 'profile' ? (
            <div className="space-y-6">
              {/* Header section */}
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Learner Profile Settings</h2>
                <p className="text-slate-500 text-sm mt-0.5">Customize your learning goal, proficiency standard, and practice targets.</p>
              </div>

              {/* Profile Editor Card */}
              <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-indigo-500/5">
                <form onSubmit={handleProfileSave} className="space-y-6">
                  
                  {/* Basic Details */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">First Name</label>
                      <input 
                        type="text" 
                        value={firstName} 
                        onChange={(e) => setFirstName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Last Name</label>
                      <input 
                        type="text" 
                        value={lastName} 
                        onChange={(e) => setLastName(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Bio</label>
                    <textarea 
                      rows="3" 
                      value={bio}
                      onChange={(e) => setBio(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2 px-3 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm"
                    />
                  </div>

                  {/* Skill level toggles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Proficiency Level</label>
                    <div className="flex space-x-2">
                      {['Beginner', 'Intermediate', 'Advanced'].map((level) => {
                        const isSelected = skillLevel === level;
                        return (
                          <button
                            key={level}
                            type="button"
                            onClick={() => setSkillLevel(level)}
                            className={`px-4 py-2 text-sm font-semibold rounded-xl transition duration-200 ${
                              isSelected 
                                ? 'bg-indigo-600 text-white shadow-sm' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {level}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Goals Options Toggles */}
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Learning Goals</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {goalsOptions.map((goal) => {
                        const GoalIcon = goal.icon;
                        const isSelected = learningGoals.includes(goal.id);
                        return (
                          <button
                            key={goal.id}
                            type="button"
                            onClick={() => handleGoalToggle(goal.id)}
                            className={`flex items-center space-x-3 p-3.5 rounded-xl border text-left transition duration-200 ${
                              isSelected 
                                ? 'border-indigo-600 bg-indigo-50/20 text-indigo-600 font-semibold' 
                                : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className={`p-1.5 rounded-lg ${isSelected ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-500'}`}>
                              <GoalIcon className="h-4 w-4" />
                            </div>
                            <span className="text-sm">{goal.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Target practice hours */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-sm font-medium text-slate-700">Target Practice Hours per Week</label>
                      <span className="text-sm font-bold text-indigo-600">{targetHours} Hours</span>
                    </div>
                    <input 
                      type="range" 
                      min="1" 
                      max="20" 
                      value={targetHours}
                      onChange={(e) => setTargetHours(Number(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 mt-1">
                      <span>1 hr</span>
                      <span>10 hrs</span>
                      <span>20 hrs</span>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="pt-2">
                    <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-xl transition shadow-sm hover:shadow-md">
                      Save Profile Settings
                    </button>
                  </div>

                </form>
              </div>
            </div>
          ) : activeTab === 'sandbox' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold text-slate-900">Practice Sandbox</h2>
                <p className="text-slate-500 text-sm mt-0.5">Practice ASL letters and words with real-time AI skeleton overlays and accuracy metrics.</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                {/* Left Card: Reference & Instructions */}
                <div className="lg:col-span-1 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-indigo-500/5 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">Reference Guidelines</h3>
                    <p className="text-slate-500 text-xs mt-0.5">Select a target sign and align your movements.</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2">Select Sign to Practice</label>
                    <select 
                      value={selectedSign}
                      onChange={(e) => setSelectedSign(e.target.value)}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-3.5 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition text-sm font-medium"
                    >
                      <optgroup label="Alphabet (Static)">
                        {['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'].map(l => (
                          <option key={l} value={l}>Letter {l}</option>
                        ))}
                      </optgroup>

                      <optgroup label="Words (Dynamic)">
                        {['drink', 'help', 'no', 'yes', 'eat', 'friend', 'happy', 'more', 'please', 'sad', 'sorry', 'hello', 'goodbye'].map(w => (
                          <option key={w} value={w}>{w.charAt(0).toUpperCase() + w.slice(1)}</option>
                        ))}
                      </optgroup>
                    </select>
                  </div>

                  <div className="border-t border-slate-100 pt-4 space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Visual Guide</h4>
                    <div className="aspect-[4/3] w-full bg-slate-50 border border-slate-200/80 rounded-xl flex items-center justify-center text-slate-400 font-bold text-sm">
                      <span className="text-indigo-600 text-lg font-extrabold">ASL: {selectedSign}</span>
                    </div>
                  </div>

                  <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/60 space-y-2">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Practice Guidelines</h4>
                    <ul className="text-xs text-slate-600 space-y-1.5 list-disc pl-4">
                      <li>Position your hand inside the camera bounding box.</li>
                      <li>For letters: hold the shape steady and press <strong>Analyze Sign</strong>.</li>
                      <li>For words: press <strong>Record Attempt</strong>, perform the movement, and then press <strong>Analyze Sign</strong>.</li>
                      <li>Keep background lighting clear to assist joint tracking.</li>
                    </ul>
                  </div>
                </div>

                {/* Right Card: Webcam Feed */}
                <div className="lg:col-span-2 bg-white border border-slate-200/80 rounded-2xl p-6 shadow-sm shadow-indigo-500/5">
                  <CameraFeed 
                    userId="1" 
                    signId={selectedSign} 
                    onAssessmentCompleted={(res) => console.log("Assessment completed:", res)} 
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="border-2 border-dashed border-slate-200 rounded-2xl h-96 flex flex-col items-center justify-center text-slate-400 bg-white shadow-sm">
              <p className="text-lg font-medium text-slate-500">Sub-View: {activeTab}</p>
              <p className="text-sm mt-1">Milestone 1 Core Shell is ready to take active modules.</p>
            </div>
          )}
        </main>
      </div>

    </div>
  );
}
