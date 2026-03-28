import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Quote, generateQuote } from './services/geminiService';
import { Sparkles, Languages, RefreshCw, Quote as QuoteIcon, Share2, Copy, Check } from 'lucide-react';

const CATEGORIES = [
  { id: 'wisdom', label: 'Wisdom', khmer: 'បញ្ញា' },
  { id: 'motivation', label: 'Motivation', khmer: 'ការលើកទឹកចិត្ត' },
  { id: 'love', label: 'Love', khmer: 'សេចក្តីស្រឡាញ់' },
  { id: 'nature', label: 'Nature', khmer: 'ធម្មជាតិ' },
  { id: 'success', label: 'Success', khmer: 'ភាពជោគជ័យ' },
];

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('wisdom');
  const [copied, setCopied] = useState(false);

  const fetchNewQuote = useCallback(async (cat: string = category) => {
    setLoading(true);
    try {
      const newQuote = await generateQuote(cat);
      setQuote(newQuote);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [category]);

  useEffect(() => {
    fetchNewQuote();
  }, []);

  const handleCopy = () => {
    if (!quote) return;
    const text = `${quote.khmer}\n${quote.english}\n— ${quote.author}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 md:p-12 relative overflow-hidden">
      {/* Background Decorative Elements */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-orange-100/50 rounded-full blur-3xl -z-10" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-50/50 rounded-full blur-3xl -z-10" />

      <header className="mb-12 text-center">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-center gap-2 mb-2"
        >
          <Languages className="w-6 h-6 text-orange-600" />
          <h1 className="font-display text-3xl md:text-4xl text-gray-900 tracking-wide">
            ពុទ្ធិ <span className="font-sans font-light italic text-gray-400 ml-2">Puthy</span>
          </h1>
        </motion.div>
        <p className="text-sm text-gray-500 uppercase tracking-widest font-medium">
          Khmer & English Wisdom
        </p>
      </header>

      <main className="w-full max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                fetchNewQuote(cat.id);
              }}
              disabled={loading}
              className={`px-4 py-2 rounded-full text-sm transition-all duration-300 border ${
                category === cat.id
                  ? 'bg-gray-900 text-white border-gray-900 shadow-lg'
                  : 'bg-white text-gray-600 border-gray-200 hover:border-gray-400'
              }`}
            >
              <span className="mr-1">{cat.khmer}</span>
              <span className="opacity-60 text-[10px] uppercase tracking-tighter">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="relative bg-white border border-gray-100 rounded-[2rem] p-8 md:p-16 shadow-2xl shadow-gray-200/50 min-h-[400px] flex flex-col justify-center">
          <QuoteIcon className="absolute top-8 left-8 w-12 h-12 text-orange-50/80 -z-0" />
          
          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <RefreshCw className="w-8 h-8 text-orange-500 animate-spin" />
                <p className="text-gray-400 font-medium animate-pulse">កំពុងស្វែងរក... Seeking wisdom...</p>
              </motion.div>
            ) : quote ? (
              <motion.div
                key="quote"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10"
              >
                <div className="space-y-8">
                  <h2 className="text-2xl md:text-4xl font-medium leading-relaxed text-gray-800 text-center">
                    {quote.khmer}
                  </h2>
                  <div className="h-px w-24 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />
                  <p className="text-lg md:text-xl italic text-gray-500 text-center font-light leading-relaxed">
                    "{quote.english}"
                  </p>
                </div>
                
                <footer className="mt-12 text-center">
                  <p className="text-sm font-medium text-gray-400 uppercase tracking-[0.2em]">
                    — {quote.author} —
                  </p>
                </footer>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </div>

        <div className="mt-12 flex items-center justify-center gap-4">
          <button
            onClick={() => fetchNewQuote()}
            disabled={loading}
            className="group flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white px-8 py-4 rounded-2xl font-semibold shadow-xl shadow-orange-200 transition-all active:scale-95 disabled:opacity-50"
          >
            <Sparkles className={`w-5 h-5 ${loading ? 'animate-pulse' : 'group-hover:rotate-12 transition-transform'}`} />
            <span>Generate New Quote</span>
          </button>
          
          <button
            onClick={handleCopy}
            disabled={!quote || loading}
            className="p-4 bg-white border border-gray-200 rounded-2xl text-gray-500 hover:text-gray-900 hover:border-gray-900 transition-all active:scale-95 disabled:opacity-50"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-6 h-6 text-green-500" /> : <Copy className="w-6 h-6" />}
          </button>
        </div>
      </main>

      <footer className="mt-auto pt-12 text-gray-400 text-[10px] uppercase tracking-[0.3em] font-medium">
        Powered by Gemini AI • Khmer-English Edition
      </footer>
    </div>
  );
}
