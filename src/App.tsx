import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { toPng } from 'html-to-image';
import { Quote, generateQuote } from './services/geminiService';
import { Sparkles, Languages, RefreshCw, Quote as QuoteIcon, Share2, Copy, Check, Loader2, Image as ImageIcon, Download } from 'lucide-react';

const CATEGORIES = [
  { id: 'wisdom', label: 'Wisdom', khmer: 'បញ្ញា' },
  { id: 'motivation', label: 'Motivation', khmer: 'ការលើកទឹកចិត្ត' },
  { id: 'peace', label: 'Peace', khmer: 'សន្តិភាព' },
  { id: 'mindfulness', label: 'Mindfulness', khmer: 'ស្មារតី' },
  { id: 'family', label: 'Family', khmer: 'គ្រួសារ' },
  { id: 'nature', label: 'Nature', khmer: 'ធម្មជាតិ' },
  { id: 'education', label: 'Education', khmer: 'ការអប់រំ' },
  { id: 'compassion', label: 'Compassion', khmer: 'សេចក្តីមេត្តា' },
  { id: 'happiness', label: 'Happiness', khmer: 'សុភមង្គល' },
];

export default function App() {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [category, setCategory] = useState('wisdom');
  const [copied, setCopied] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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

  const handleDownloadImage = async () => {
    if (!cardRef.current || !quote) return;
    
    try {
      setLoading(true);
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: 'transparent',
      });
      
      const link = document.createElement('a');
      link.download = `puthy-wisdom-${quote.author.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Could not generate image', err);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    if (!quote || !cardRef.current) return;

    try {
      setLoading(true);
      
      // 1. Generate PNG from the card
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        backgroundColor: 'transparent',
      });

      // 2. Convert dataUrl to File
      const response = await fetch(dataUrl);
      const blob = await response.blob();
      const fileName = `puthy-wisdom-${quote.author.toLowerCase().replace(/\s+/g, '-')}.png`;
      const file = new File([blob], fileName, { type: 'image/png' });

      const shareData: ShareData = {
        title: 'Puthy Wisdom',
        text: `${quote.khmer}\n${quote.english}\n— ${quote.author}`,
        files: [file],
      };

      // 3. Check if sharing files is supported
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share(shareData);
      } else if (navigator.share) {
        // Fallback to text-only share if files not supported
        const { files, ...textShareData } = shareData;
        await navigator.share(textShareData);
      } else {
        // Fallback for browsers that don't support Web Share API at all
        const mailtoLink = `mailto:?subject=Puthy Wisdom Quote&body=${encodeURIComponent(shareData.text || '')}`;
        window.location.href = mailtoLink;
      }
    } catch (error) {
      console.error('Error sharing:', error);
    } finally {
      setLoading(false);
    }
  };

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
          <h1 className="font-display text-3xl md:text-4xl text-black">
            ពុទ្ធិ <span className="font-sans font-light text-black ml-2">Puthy</span>
          </h1>
        </motion.div>
        <p className="text-sm text-black uppercase tracking-widest font-medium">
          Khmer & English Wisdom
        </p>
      </header>

      <main className="w-full max-w-3xl">
        <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              onClick={() => {
                setCategory(cat.id);
                fetchNewQuote(cat.id);
              }}
              disabled={loading}
              className={`px-3 py-1.5 md:px-4 md:py-2 rounded-full text-xs md:text-sm transition-all duration-300 border ${
                category === cat.id
                  ? 'bg-yellow-400 text-black border-yellow-400'
                  : 'bg-white text-black border-gray-200 hover:border-black'
              }`}
            >
              <span className="mr-1">{cat.khmer}</span>
              <span className="opacity-60 text-[8px] md:text-[10px] uppercase tracking-tighter">{cat.label}</span>
            </button>
          ))}
        </div>

        <div 
          ref={cardRef}
          className="relative bg-white border border-gray-100 rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-16 shadow-2xl shadow-gray-200/50 min-h-[320px] md:min-h-[400px] flex flex-col justify-center overflow-hidden"
        >
          <QuoteIcon className="absolute top-4 left-4 md:top-8 md:left-8 w-8 h-8 md:w-12 md:h-12 text-gray-100 -z-0" />
          
          <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2 z-20">
            <button
              onClick={handleShare}
              disabled={!quote || loading}
              className="p-2 rounded-full bg-gray-50 text-gray-400 hover:text-black transition-all"
              title="Share quote"
            >
              <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            </button>
          </div>

          <AnimatePresence mode="wait">
            {loading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center gap-4"
              >
                <RefreshCw className="w-6 h-6 md:w-8 md:h-8 text-black animate-spin" />
                <p className="text-black text-sm md:text-base font-medium animate-pulse">កំពុងស្វែងរក... Seeking wisdom...</p>
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
                <div className="space-y-6 md:space-y-8 mt-12">
                  <h2 className="text-xl md:text-4xl font-display leading-loose text-black text-center px-2">
                    {quote.khmer}
                  </h2>
                  <div className="h-px w-16 md:w-24 bg-gradient-to-r from-transparent via-gray-200 to-transparent mx-auto" />
                  <p className="text-base md:text-xl italic text-black text-center font-light leading-relaxed px-2">
                    "{quote.english}"
                  </p>
                </div>
                
                <footer className="mt-8 md:mt-12 text-center">
                  <p className="text-[10px] md:text-sm font-medium text-black uppercase tracking-[0.2em]">
                    — {quote.author} —
                  </p>
                </footer>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div className="absolute bottom-4 left-0 right-0 text-center z-0 opacity-20 pointer-events-none">
            <p className="text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-medium text-black">
              Powered by mebon.io
            </p>
          </div>
        </div>

        <div className="mt-8 md:mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => fetchNewQuote()}
            disabled={loading}
            className="w-full sm:w-auto group flex flex-col items-center bg-yellow-400 hover:bg-yellow-500 text-black px-8 md:px-10 py-3 md:py-4 rounded-xl md:rounded-2xl font-semibold transition-all active:scale-95 disabled:opacity-50"
          >
            <span className="text-base md:text-lg">បង្កើតសម្រង់សម្តីថ្មី</span>
            <span className="text-[8px] md:text-[10px] uppercase tracking-widest font-normal">Generate New Quote</span>
          </button>
          
          <button
            onClick={handleCopy}
            disabled={!quote || loading}
            className="w-full sm:w-auto p-3 md:p-4 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-black hover:border-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-5 h-5 md:w-6 md:h-6 text-green-500" /> : <Copy className="w-5 h-5 md:w-6 md:h-6" />}
            <span className="sm:hidden text-sm font-medium">Copy Quote</span>
          </button>

          <button
            onClick={handleDownloadImage}
            disabled={!quote || loading}
            className="w-full sm:w-auto p-3 md:p-4 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-black hover:border-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            title="Save as Photo"
          >
            <Download className="w-5 h-5 md:w-6 md:h-6" />
            <span className="sm:hidden text-sm font-medium">Save as Photo</span>
          </button>

          <button
            onClick={handleShare}
            disabled={!quote || loading}
            className="w-full sm:w-auto p-3 md:p-4 bg-white border border-gray-200 rounded-xl md:rounded-2xl text-black hover:border-black transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
            title="Share quote"
          >
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
            <span className="sm:hidden text-sm font-medium">Share Quote</span>
          </button>
        </div>
      </main>

      <footer className="mt-auto pt-12 text-black text-[8px] md:text-[10px] uppercase tracking-[0.3em] font-medium">
        Powered by mebon.io • Khmer-English Edition
      </footer>
    </div>
  );
}
