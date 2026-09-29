import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Sun, Moon, Bell, LogOut, Menu, Search, Mic, ChevronDown, User } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';

interface TopBarProps {
  onToggleSidebar: () => void;
  onToggleAlerts: () => void;
  alertCount: number;
  onSearch: (query: string) => void;
}

export default function TopBar({ onToggleSidebar, onToggleAlerts, alertCount, onSearch }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [listening, setListening] = useState(false);
  const [voiceUnsupported, setVoiceUnsupported] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Initialize speech recognition
  useEffect(() => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SR) {
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setSearchQuery(transcript);
        setListening(false);
        onSearch(transcript);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    } else {
      setVoiceUnsupported(true);
    }
  }, [onSearch]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) onSearch(searchQuery);
  };

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      try {
        recognitionRef.current.start();
      } catch {
        setListening(false);
      }
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/50 dark:border-slate-800/50 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: menu + logo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle navigation"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="hidden text-lg font-bold tracking-[0.15em] bg-gradient-to-r from-cyan-500 to-teal-500 bg-clip-text text-transparent sm:inline">
            TWINNEX
          </span>
        </div>

        {/* Center: AI search */}
        <div className="flex-1 max-w-md">
          <form onSubmit={handleSearch} className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={listening ? 'Listening…' : 'Ask AI about well data, simulations, anomalies…'}
              className={`w-full rounded-xl border bg-slate-50 dark:bg-slate-900 py-2 pl-10 pr-10 text-sm text-slate-800 dark:text-white placeholder-slate-400 outline-none transition focus:ring-2 focus:ring-cyan-500/20 ${
                listening ? 'border-red-400 animate-pulse' : 'border-slate-200 dark:border-slate-700 focus:border-cyan-500'
              }`}
            />
            <button
              type="button"
              onClick={toggleVoice}
              disabled={voiceUnsupported}
              title={voiceUnsupported ? 'Voice search not supported in this browser' : 'Click to speak'}
              className={`absolute right-2.5 top-1/2 -translate-y-1/2 rounded-lg p-1 transition disabled:opacity-30 ${
                listening
                  ? 'text-red-500 animate-pulse'
                  : 'text-slate-400 hover:text-cyan-500'
              }`}
              aria-label="Voice search"
            >
              <Mic className="h-4 w-4" />
            </button>
          </form>
        </div>

        {/* Right: alerts, theme, user */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleAlerts}
            className="relative rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Alerts"
          >
            <Bell className="h-5 w-5" />
            {alertCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                {alertCount}
              </span>
            )}
          </button>

          <button
            onClick={toggleTheme}
            className="rounded-lg p-2 text-slate-600 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
          </button>

          {/* User dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setUserMenuOpen((v) => !v)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 text-sm text-slate-700 dark:text-slate-300 transition hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 text-white">
                <User className="h-4 w-4" />
              </div>
              <ChevronDown className="h-4 w-4 text-slate-400" />
            </button>

            {userMenuOpen && (
              <div className="absolute right-0 top-12 w-64 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in">
                <div className="border-b border-slate-100 dark:border-slate-800 px-4 py-3">
                  <p className="text-xs font-medium text-slate-400">Signed in as</p>
                  <p className="truncate text-sm font-semibold text-slate-800 dark:text-white">{user?.email}</p>
                </div>
                <button
                  onClick={() => {
                    signOut();
                    setUserMenuOpen(false);
                  }}
                  className="flex w-full items-center gap-2 px-4 py-3 text-sm text-red-500 transition hover:bg-red-50 dark:hover:bg-red-950/30"
                >
                  <LogOut className="h-4 w-4" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
