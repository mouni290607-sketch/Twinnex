import { useState, useRef, useEffect } from 'react';
import { Mic, X, Send, Sparkles, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'assistant';
  text: string;
}

interface AIAssistantProps {
  query: string;
  onQueryConsumed: () => void;
}

export default function AIAssistant({ query, onQueryConsumed }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [listening, setListening] = useState(false);
  const [thinking, setThinking] = useState(false);
  const recognitionRef = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SR();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';
      recognitionRef.current.onresult = (e: any) => {
        const transcript = e.results[0][0].transcript;
        setInput(transcript);
        setListening(false);
      };
      recognitionRef.current.onend = () => setListening(false);
      recognitionRef.current.onerror = () => setListening(false);
    }
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, thinking]);

  // Handle queries from the top search bar
  useEffect(() => {
    if (query) {
      setInput(query);
      setOpen(true);
      onQueryConsumed();
    }
  }, [query, onQueryConsumed]);

  const toggleVoice = () => {
    if (!recognitionRef.current) return;
    if (listening) {
      recognitionRef.current.stop();
      setListening(false);
    } else {
      setListening(true);
      recognitionRef.current.start();
    }
  };

  const generateAnswer = (q: string): string => {
    const lower = q.toLowerCase();
    if (lower.includes('production') || lower.includes('oil')) {
      return 'Current oil production for Well BW-01 is approximately 85 BPD. The optimization module can recommend settings to increase this. Navigate to the Optimization page and select "Maximize Oil Production".';
    }
    if (lower.includes('temperature') || lower.includes('steam')) {
      return 'Steam injection is currently at 450 BPD at 350°F. CSS simulation shows that increasing steam temperature reduces oil viscosity and improves flow. Try the CSS page to run simulations.';
    }
    if (lower.includes('pressure')) {
      return 'Wellhead pressure is 320 psi, bottom-hole pressure is 1450 psi. Both are within normal range. Check the Anomalies page for any pressure-related alerts.';
    }
    if (lower.includes('srp') || lower.includes('pump')) {
      return 'SRP is running at 6.5 SPM with 120-inch stroke. Pump condition is Good. Visit the SRP page to simulate different speeds and check for pump problems.';
    }
    if (lower.includes('anomal') || lower.includes('alert') || lower.includes('warning')) {
      return 'Current anomalies: BW-03 has declining bottom-hole pressure (warning), BW-05 shows production decline (warning), BW-06 has critical pump anomaly. Check the Anomalies page for details.';
    }
    if (lower.includes('optim')) {
      return 'The Optimization page evaluates combinations of steam rate, temperature, pressure, SRP speed, and stroke length. Select an objective (maximize production, reduce energy, or balance) and click Run Optimization.';
    }
    if (lower.includes('energy')) {
      return 'Current energy consumption is 42.5 kW. The optimization module can recommend settings to reduce energy while maintaining production.';
    }
    if (lower.includes('digital twin') || lower.includes('twin')) {
      return 'The Digital Twin page shows the complete well-to-surface flow: Reservoir → Heavy Oil → Wellbore → CSS Steam → SRP Pump → Surface → Production. It updates based on your simulation inputs.';
    }
    return 'I can help with questions about oil production, steam injection, SRP settings, pressure, temperature, anomalies, and optimization. Try asking about a specific parameter or navigate to the relevant page.';
  };

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      const answer = generateAnswer(input);
      setMessages((prev) => [...prev, { role: 'assistant', text: answer }]);
      setThinking(false);
    }, 700);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className={`fixed bottom-6 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 text-white shadow-2xl shadow-cyan-500/40 transition hover:scale-110 ${open ? 'rotate-90' : ''}`}
        aria-label="AI Assistant"
      >
        {open ? <X className="h-6 w-6" /> : <Sparkles className="h-6 w-6" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-40 flex h-[28rem] w-[calc(100vw-3rem)] max-w-sm flex-col overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xl animate-scale-in">
          <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 px-4 py-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600">
              <Sparkles className="h-4 w-4 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900 dark:text-white">AI Assistant</h3>
              <p className="text-[11px] text-slate-400">Ask about well data, simulations, or anomalies</p>
            </div>
          </div>

          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4">
            {messages.length === 0 ? (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <Sparkles className="mb-3 h-10 w-10 text-cyan-200 dark:text-cyan-800" />
                <p className="text-sm text-slate-500 dark:text-slate-400">Ask me about production, steam, SRP, pressure, anomalies, or optimization.</p>
                <p className="mt-1 text-xs text-slate-400">You can also use voice search.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${msg.role === 'user' ? 'bg-cyan-500 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'}`}>
                      {msg.text}
                    </div>
                  </div>
                ))}
                {thinking && (
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <Loader2 className="h-4 w-4 animate-spin" /> Thinking…
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 p-3">
            <div className="flex items-center gap-2">
              <button
                onClick={toggleVoice}
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition ${listening ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
                aria-label="Voice search"
              >
                <Mic className="h-5 w-5" />
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                placeholder={listening ? 'Listening…' : 'Ask a question…'}
                className="flex-1 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-4 py-2.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 outline-none transition focus:border-cyan-500 focus:ring-2 focus:ring-cyan-500/20"
              />
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-500 text-white transition hover:bg-cyan-600 disabled:opacity-40"
                aria-label="Send"
              >
                <Send className="h-4.5 w-4.5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
