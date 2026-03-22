/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Code2, 
  Terminal, 
  Sparkles, 
  Play, 
  Copy, 
  Check, 
  ChevronRight, 
  Search, 
  Plus, 
  BookOpen, 
  Cpu,
  ArrowRight,
  Info,
  Loader2,
  X
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';
import ReactMarkdown from 'react-markdown';
import { GoogleGenAI } from "@google/genai";
import { PREBUILT_PROJECTS, PythonProject } from './projects';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export default function App() {
  const [selectedProject, setSelectedProject] = useState<PythonProject | null>(PREBUILT_PROJECTS[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [copied, setCopied] = useState(false);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [isExplaining, setIsExplaining] = useState(false);
  const [customProjects, setCustomProjects] = useState<PythonProject[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const allProjects = [...PREBUILT_PROJECTS, ...customProjects];
  const filteredProjects = allProjects.filter(p => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopy = () => {
    if (selectedProject) {
      navigator.clipboard.writeText(selectedProject.code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const generateProject = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: `Generate a simple Python project based on this prompt: "${prompt}". 
        Return ONLY a JSON object with the following structure:
        {
          "name": "Project Name",
          "description": "Short description",
          "code": "The full python code",
          "difficulty": "Beginner" | "Intermediate" | "Advanced",
          "category": "Category Name"
        }`,
        config: {
          responseMimeType: "application/json"
        }
      });

      const result = JSON.parse(response.text || '{}');
      const newProject: PythonProject = {
        id: Math.random().toString(36).substr(2, 9),
        ...result
      };
      setCustomProjects(prev => [newProject, ...prev]);
      setSelectedProject(newProject);
      setPrompt('');
      setExplanation(null);
    } catch (error) {
      console.error("Generation error:", error);
    } finally {
      setIsGenerating(false);
    }
  };

  const explainCode = async () => {
    if (!selectedProject) return;
    setIsExplaining(true);
    try {
      const model = "gemini-3-flash-preview";
      const response = await ai.models.generateContent({
        model,
        contents: `Explain this Python code in simple terms for a beginner. Highlight key concepts like loops, functions, or libraries used:
        
        \`\`\`python
        ${selectedProject.code}
        \`\`\``,
      });
      setExplanation(response.text || "No explanation generated.");
    } catch (error) {
      console.error("Explanation error:", error);
    } finally {
      setIsExplaining(false);
    }
  };

  useEffect(() => {
    setExplanation(null);
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-[#0F172A] text-slate-200 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
              <Code2 className="text-white w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-xl tracking-tight text-white">Python Hub</h1>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest">Project Generator</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
              <input 
                type="text" 
                placeholder="Search projects..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-800 border-none rounded-full pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-indigo-500 w-64 transition-all outline-none"
              />
            </div>
            <button 
              onClick={() => document.getElementById('generator-section')?.scrollIntoView({ behavior: 'smooth' })}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-full text-sm font-semibold transition-all flex items-center gap-2 shadow-lg shadow-indigo-500/20"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Project</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-3 space-y-6">
          <div className="space-y-4">
            <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Library</h2>
            <div className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
              {filteredProjects.map((project) => (
                <button
                  key={project.id}
                  onClick={() => setSelectedProject(project)}
                  className={cn(
                    "w-full text-left px-4 py-3 rounded-xl transition-all group flex items-center justify-between",
                    selectedProject?.id === project.id 
                      ? "bg-indigo-600/10 text-indigo-400 border border-indigo-500/20" 
                      : "hover:bg-slate-800 text-slate-400 border border-transparent"
                  )}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <div className={cn(
                      "w-2 h-2 rounded-full shrink-0",
                      project.difficulty === 'Beginner' ? "bg-emerald-500" : 
                      project.difficulty === 'Intermediate' ? "bg-amber-500" : "bg-rose-500"
                    )} />
                    <span className="truncate font-medium">{project.name}</span>
                  </div>
                  <ChevronRight className={cn(
                    "w-4 h-4 transition-transform",
                    selectedProject?.id === project.id ? "translate-x-0 opacity-100" : "-translate-x-2 opacity-0 group-hover:translate-x-0 group-hover:opacity-100"
                  )} />
                </button>
              ))}
              {filteredProjects.length === 0 && (
                <div className="text-center py-8 text-slate-500">
                  <p className="text-sm">No projects found</p>
                </div>
              )}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-indigo-600/5 border border-indigo-500/10 space-y-3">
            <div className="flex items-center gap-2 text-indigo-400">
              <Info className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wider">Quick Tip</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Python is great for beginners because of its readable syntax. Try generating a "Hangman game" or a "Web Scraper"!
            </p>
          </div>
        </aside>

        {/* Main Content */}
        <div className="lg:col-span-9 space-y-8">
          {selectedProject ? (
            <motion.div 
              key={selectedProject.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Project Header */}
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider">
                      {selectedProject.category}
                    </span>
                    <span className={cn(
                      "px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider",
                      selectedProject.difficulty === 'Beginner' ? "bg-emerald-500/10 text-emerald-400" : 
                      selectedProject.difficulty === 'Intermediate' ? "bg-amber-500/10 text-amber-400" : "bg-rose-500/10 text-rose-400"
                    )}>
                      {selectedProject.difficulty}
                    </span>
                  </div>
                  <h2 className="text-3xl font-bold text-white tracking-tight">{selectedProject.name}</h2>
                  <p className="text-slate-400 max-w-2xl">{selectedProject.description}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <button 
                    onClick={handleCopy}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy Code'}
                  </button>
                  <button 
                    onClick={explainCode}
                    disabled={isExplaining}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    {isExplaining ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                    Explain Logic
                  </button>
                </div>
              </div>

              {/* Code Editor */}
              <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-[#1E1E1E]">
                <div className="bg-slate-900/80 px-4 py-2 flex items-center justify-between border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      <div className="w-3 h-3 rounded-full bg-rose-500/50" />
                      <div className="w-3 h-3 rounded-full bg-amber-500/50" />
                      <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
                    </div>
                    <span className="text-[10px] font-mono text-slate-500 ml-2 uppercase tracking-widest">main.py</span>
                  </div>
                  <Terminal className="w-4 h-4 text-slate-600" />
                </div>
                <div className="p-1 max-h-[500px] overflow-auto custom-scrollbar">
                  <SyntaxHighlighter 
                    language="python" 
                    style={vscDarkPlus}
                    customStyle={{ 
                      margin: 0, 
                      padding: '1.5rem', 
                      fontSize: '14px',
                      background: 'transparent'
                    }}
                    showLineNumbers
                  >
                    {selectedProject.code}
                  </SyntaxHighlighter>
                </div>
              </div>

              {/* Explanation Panel */}
              <AnimatePresence>
                {explanation && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden"
                  >
                    <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-800/30">
                      <div className="flex items-center gap-2 text-indigo-400">
                        <BookOpen className="w-5 h-5" />
                        <h3 className="font-bold text-sm uppercase tracking-widest">Logic Breakdown</h3>
                      </div>
                      <button onClick={() => setExplanation(null)} className="text-slate-500 hover:text-slate-300">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="p-6 prose prose-invert prose-indigo max-w-none prose-sm">
                      <ReactMarkdown>{explanation}</ReactMarkdown>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ) : (
            <div className="h-[60vh] flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center">
                <Cpu className="w-8 h-8 text-slate-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">No Project Selected</h3>
                <p className="text-slate-500">Select a project from the library or generate a new one.</p>
              </div>
            </div>
          )}

          {/* Generator Section */}
          <section id="generator-section" className="pt-12 border-t border-slate-800">
            <div className="rounded-3xl bg-gradient-to-br from-indigo-600 to-violet-700 p-8 md:p-12 relative overflow-hidden shadow-2xl shadow-indigo-500/20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-indigo-400/20 rounded-full translate-y-1/2 -translate-x-1/2 blur-2xl" />
              
              <div className="relative z-10 max-w-2xl space-y-6">
                <div className="space-y-2">
                  <h2 className="text-3xl font-bold text-white tracking-tight">Need something specific?</h2>
                  <p className="text-indigo-100 text-lg opacity-90">Describe a Python project idea and our AI will build the starter code for you.</p>
                </div>
                
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <input 
                      type="text" 
                      placeholder="e.g., A simple weather app using an API..."
                      value={prompt}
                      onChange={(e) => setPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && generateProject()}
                      className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-white placeholder:text-indigo-200 outline-none focus:ring-2 focus:ring-white/50 transition-all backdrop-blur-sm"
                    />
                  </div>
                  <button 
                    onClick={generateProject}
                    disabled={isGenerating || !prompt.trim()}
                    className="bg-white text-indigo-600 hover:bg-indigo-50 px-8 py-4 rounded-2xl font-bold transition-all flex items-center justify-center gap-2 disabled:opacity-50 shrink-0 shadow-lg"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Generate
                  </button>
                </div>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {['Password Generator', 'Web Scraper', 'Chat Bot', 'Data Visualizer'].map(tag => (
                    <button 
                      key={tag}
                      onClick={() => setPrompt(tag)}
                      className="text-[10px] font-bold uppercase tracking-wider bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full transition-colors border border-white/10"
                    >
                      {tag}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-4 py-12 border-t border-slate-800 text-center space-y-4">
        <div className="flex items-center justify-center gap-2 text-slate-500">
          <Code2 className="w-4 h-4" />
          <span className="text-sm font-medium">Python Project Generator &copy; 2026</span>
        </div>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          This tool is designed for educational purposes. Always verify AI-generated code before running it in a production environment.
        </p>
      </footer>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #334155;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #475569;
        }
      `}</style>
    </div>
  );
}
