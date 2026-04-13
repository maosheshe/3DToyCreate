import * as React from 'react';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, Sparkles, RefreshCw, Download, Image as ImageIcon, ArrowRight, Key } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';
import { generateToyImage } from './services/geminiService';

export default function App() {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [sourceMimeType, setSourceMimeType] = useState<string>('');
  const [resultImage, setResultImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasKey, setHasKey] = useState<boolean | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio?.hasSelectedApiKey) {
        // @ts-ignore
        const selected = await window.aistudio.hasSelectedApiKey();
        setHasKey(selected);
      } else {
        setHasKey(true);
      }
    };
    checkKey();
  }, []);

  const handleSelectKey = async () => {
    // @ts-ignore
    if (window.aistudio?.openSelectKey) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      setHasKey(true);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setSourceImage(event.target?.result as string);
        setSourceMimeType(file.type);
        setResultImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConvert = async () => {
    if (!sourceImage) {
      toast.error('Please upload an image first');
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateToyImage(sourceImage, sourceMimeType);
      setResultImage(result);
      toast.success('3D Toy generated successfully!');
    } catch (error: any) {
      console.error(error);
      if (error.message?.includes('Requested entity was not found') || error.message?.includes('PERMISSION_DENIED')) {
        setHasKey(false);
        toast.error('API Key permission error. Please select a valid paid API key.');
      } else {
        toast.error('Failed to generate toy. Please try again.');
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadResult = () => {
    if (!resultImage) return;
    const link = document.createElement('a');
    link.href = resultImage;
    link.download = 'snake-toy.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-[#F8F9FA] text-[#1A1A1A] font-sans selection:bg-orange-100">
      <Toaster position="top-center" />
      
      {/* Header */}
      <header className="border-b border-gray-200 bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="text-white w-5 h-5" />
            </div>
            <h1 className="font-bold text-xl tracking-tight">Toy Creator</h1>
          </div>
          <div className="flex items-center gap-3">
            {hasKey === false && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSelectKey}
                className="text-orange-600 border-orange-200 hover:bg-orange-50"
              >
                <Key className="w-4 h-4 mr-2" />
                Setup API Key
              </Button>
            )}
            <Badge variant="outline" className="font-medium text-orange-600 border-orange-200 bg-orange-50">
              Gemini Powered
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          
          {/* Left Column: Source */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <ImageIcon className="w-6 h-6 text-orange-500" />
                Source Character
              </h2>
              {sourceImage && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => fileInputRef.current?.click()}
                  className="text-gray-500 hover:text-orange-600"
                >
                  Change Image
                </Button>
              )}
            </div>

            <Card 
              className={`relative overflow-hidden border-2 border-dashed transition-all duration-300 ${
                !sourceImage ? 'border-gray-300 bg-gray-50 hover:border-orange-400 hover:bg-orange-50/30' : 'border-transparent bg-white shadow-xl'
              }`}
              onClick={() => !sourceImage && fileInputRef.current?.click()}
            >
              <CardContent className="p-0">
                <div className="aspect-square flex flex-col items-center justify-center cursor-pointer">
                  {sourceImage ? (
                    <motion.img 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      src={sourceImage} 
                      alt="Source" 
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="text-center p-12">
                      <div className="w-16 h-16 bg-white rounded-2xl shadow-sm flex items-center justify-center mx-auto mb-4">
                        <Upload className="text-gray-400 w-8 h-8" />
                      </div>
                      <p className="text-lg font-medium text-gray-900">Upload your character</p>
                      <p className="text-sm text-gray-500 mt-1">Drag and drop or click to browse</p>
                    </div>
                  )}
                </div>
              </CardContent>
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileChange} 
                className="hidden" 
                accept="image/*"
              />
            </Card>

            <div className="flex flex-col gap-4">
              {hasKey === false && (
                <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl flex items-start gap-3">
                  <Key className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-bold text-orange-900">API Key Required</p>
                    <p className="text-xs text-orange-700 mt-1">
                      Image generation requires a paid Google Cloud API key. 
                      <button onClick={handleSelectKey} className="ml-1 underline font-bold hover:text-orange-800">
                        Click here to set it up
                      </button>.
                    </p>
                  </div>
                </div>
              )}
              <Button 
                size="lg" 
                className="w-full h-14 text-lg font-bold bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-200 transition-all active:scale-[0.98]"
                disabled={!sourceImage || isGenerating}
                onClick={handleConvert}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="mr-2 h-5 w-5 animate-spin" />
                    Creating Magic...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Turn into 3D Toy
                  </>
                )}
              </Button>
              <p className="text-center text-xs text-gray-400 uppercase tracking-widest font-semibold">
                Best results with clear character images
              </p>
            </div>
          </div>

          {/* Right Column: Result */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-orange-500" />
              3D Toy Result
            </h2>

            <Card className="relative overflow-hidden bg-white border-none shadow-2xl min-h-[400px]">
              <CardContent className="p-0 aspect-square flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                <AnimatePresence mode="wait">
                  {isGenerating ? (
                    <motion.div 
                      key="loading"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="w-full h-full p-8 space-y-4"
                    >
                      <Skeleton className="w-full h-full rounded-2xl" />
                      <div className="absolute inset-0 flex flex-col items-center justify-center text-center p-8">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        >
                          <RefreshCw className="w-12 h-12 text-orange-500 mb-4" />
                        </motion.div>
                        <p className="text-lg font-bold text-gray-900">Stitching the plushie...</p>
                        <p className="text-sm text-gray-500">Gemini is crafting your 3D toy</p>
                      </div>
                    </motion.div>
                  ) : resultImage ? (
                    <motion.div
                      key="result"
                      initial={{ scale: 0.9, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="relative w-full h-full group"
                    >
                      <img 
                        src={resultImage} 
                        alt="3D Toy Result" 
                        className="w-full h-full object-contain p-4 drop-shadow-2xl"
                      />
                      <div className="absolute bottom-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button size="icon" onClick={downloadResult} className="bg-white text-black hover:bg-gray-100 shadow-xl">
                          <Download className="w-5 h-5" />
                        </Button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center p-12 text-gray-400">
                      <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                        <ArrowRight className="w-8 h-8" />
                      </div>
                      <p className="font-medium">Your 3D toy will appear here</p>
                    </div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>

            {resultImage && (
              <div className="flex gap-4">
                <Button 
                  variant="outline" 
                  className="flex-1 h-12 border-gray-200 hover:bg-gray-50"
                  onClick={() => {
                    setResultImage(null);
                    handleConvert();
                  }}
                >
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Regenerate
                </Button>
                <Button 
                  className="flex-1 h-12 bg-black text-white hover:bg-gray-800"
                  onClick={downloadResult}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download PNG
                </Button>
              </div>
            )}
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="mt-auto py-12 border-t border-gray-200">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-sm text-gray-400 font-medium uppercase tracking-widest">
            Crafted with Gemini AI & React
          </p>
        </div>
      </footer>
    </div>
  );
}
