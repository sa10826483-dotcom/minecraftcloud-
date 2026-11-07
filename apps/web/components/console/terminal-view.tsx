'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Terminal, Send, Search, Trash2, Download, ShieldAlert, Sparkles } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';

interface TerminalViewProps {
  serverId: string;
  isOnline: boolean;
}

export function TerminalView({ serverId, isOnline }: TerminalViewProps) {
  const [logs, setLogs] = useState<string[]>([]);
  const [command, setCommand] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSending, setIsSending] = useState(false);
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Quick command suggestions
  const quickCommands = [
    '/say Hello from MinecraftCloud!',
    '/tps',
    '/list',
    '/whitelist list',
    '/timings report',
    '/geyser version',
  ];

  // Fetch initial logs and set up auto-poll / WebSocket
  useEffect(() => {
    let mounted = true;

    const fetchLogs = async () => {
      try {
        const res = await fetch(`/api/servers/${serverId}/console`);
        if (res.ok) {
          const data = await res.json();
          if (mounted && data.logs) {
            setLogs(data.logs);
          }
        }
      } catch {}
    };

    fetchLogs();
    const interval = setInterval(fetchLogs, 2500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [serverId]);

  // Scroll to bottom on new logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  const handleSendCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!command.trim() || isSending) return;

    const cmd = command.trim();
    setHistory((prev) => [...prev, cmd]);
    setHistoryIndex(-1);
    setCommand('');
    setIsSending(true);

    try {
      const res = await fetch(`/api/servers/${serverId}/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ command: cmd }),
      });
      const data = await res.json();
      if (data.response) {
        setLogs((prev) => [...prev, `[Server Output] ${data.response}`]);
      }
    } catch (err: any) {
      setLogs((prev) => [...prev, `[System Error] Failed to send command: ${err.message}`]);
    } finally {
      setIsSending(false);
    }
  };

  // Up/Down arrow key command history navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setCommand(history[nextIndex]);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIndex === -1) return;
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setCommand('');
      } else {
        setHistoryIndex(nextIndex);
        setCommand(history[nextIndex]);
      }
    }
  };

  const handleClear = () => {
    setLogs([]);
  };

  const handleDownloadLogs = () => {
    const text = logs.join('\n');
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `minecraft-server-${serverId}-${Date.now()}.log`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Filter logs if searching
  const filteredLogs = searchQuery
    ? logs.filter((line) => line.toLowerCase().includes(searchQuery.toLowerCase()))
    : logs;

  return (
    <div className="flex flex-col h-[650px] w-full rounded-2xl border border-slate-800 bg-slate-950/90 shadow-2xl overflow-hidden font-mono">
      {/* Console Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-slate-900/90 border-b border-slate-800">
        <div className="flex items-center gap-2 text-slate-300 text-sm font-semibold">
          <Terminal className="h-4 w-4 text-emerald-400" />
          <span>Interactive Server Terminal</span>
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              isOnline ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'
            }`}
          />
        </div>

        {/* Quick actions: Search, Clear, Download */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 w-36 sm:w-48 rounded-lg border border-slate-700/80 bg-slate-950/80 pl-8 pr-2 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:ring-1 focus:ring-emerald-500"
            />
          </div>

          <Button variant="ghost" size="sm" onClick={handleClear} title="Clear terminal" className="h-8 px-2.5">
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={handleDownloadLogs}
            title="Download full log"
            className="h-8 px-2.5"
          >
            <Download className="h-3.5 w-3.5 text-slate-400 hover:text-white" />
          </Button>
        </div>
      </div>

      {/* Quick Command Suggestions */}
      <div className="flex items-center gap-1.5 px-4 py-1.5 bg-slate-900/40 border-b border-slate-800/60 overflow-x-auto text-[11px] text-slate-400">
        <span className="flex items-center gap-1 font-sans text-slate-500 uppercase tracking-wider text-[10px]">
          <Sparkles className="h-3 w-3 text-emerald-400" /> Quick:
        </span>
        {quickCommands.map((q) => (
          <button
            key={q}
            onClick={() => setCommand(q)}
            className="rounded px-2 py-0.5 bg-slate-800/60 hover:bg-emerald-950 hover:text-emerald-300 text-slate-300 transition-colors whitespace-nowrap"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Terminal Screen Body */}
      <div className="flex-1 overflow-y-auto p-4 text-xs space-y-1 bg-black/60 selection:bg-emerald-500/30 selection:text-emerald-200 leading-relaxed">
        {filteredLogs.length === 0 ? (
          <div className="text-slate-500 italic py-8 text-center font-sans">
            No terminal output recorded yet. Launch server to stream real-time logs.
          </div>
        ) : (
          filteredLogs.map((log, index) => {
            const isWarn = log.includes('WARN') || log.includes('WARNING');
            const isError = log.includes('ERROR') || log.includes('Exception') || log.includes('CRASH');
            const isUser = log.includes('[User Command]');
            const isOutput = log.includes('[Server Output]');

            let textColor = 'text-slate-300';
            if (isError) textColor = 'text-red-400 font-semibold';
            else if (isWarn) textColor = 'text-amber-300';
            else if (isUser) textColor = 'text-emerald-400 font-semibold';
            else if (isOutput) textColor = 'text-cyan-300';

            return (
              <div key={index} className={`font-mono break-all ${textColor}`}>
                {log}
              </div>
            );
          })
        )}
        <div ref={terminalEndRef} />
      </div>

      {/* Command Input Area */}
      <form
        onSubmit={handleSendCommand}
        className="flex items-center gap-2 p-3 bg-slate-900/95 border-t border-slate-800"
      >
        <div className="flex items-center gap-2 flex-1 relative">
          <span className="text-emerald-400 font-bold pl-2 select-none">&gt;</span>
          <input
            type="text"
            placeholder={
              isOnline
                ? "Enter Minecraft command without slash (e.g., 'say Hello', 'whitelist add Steve', 'gamemode creative')..."
                : "Server is currently offline. Start server to execute live commands."
            }
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!isOnline || isSending}
            className="w-full h-10 bg-slate-950/80 border border-slate-700/80 rounded-lg px-3 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/80 transition-all font-mono"
          />
        </div>
        <Button
          type="submit"
          variant="glow"
          size="sm"
          disabled={!isOnline || !command.trim() || isSending}
          className="gap-1.5 h-10 px-4"
        >
          <Send className="h-3.5 w-3.5" />
          <span>Execute</span>
        </Button>
      </form>
    </div>
  );
}
