import { useState, useEffect, useRef, useCallback } from 'react';
import { Sidebar } from './components/Sidebar';
import { CommandBar } from './components/CommandBar';
import { NodeCanvas } from './components/NodeCanvas';
import { Inspector } from './components/Inspector';
import { Terminal } from './components/Terminal';
import { startOrchestration, pollSessionStatus } from './lib/api';
import type { NodeState, LogEntry, GeneratedAsset, VaultFile } from './lib/types';
import { Cpu, Zap, Database, Globe } from 'lucide-react';

function App() {
  // Core State
  const [isRunning, setIsRunning] = useState(false);
  const [_sessionId, setSessionId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Record<string, NodeState>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // System Clock
  useEffect(() => {
    const timer = setInterval(() => setSystemTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setCommandBarOpen(true);
      }
      if (e.key === 'Escape') {
        setCommandBarOpen(false);
      }
      if ((e.metaKey || e.ctrlKey) && e.key === 'j') {
        e.preventDefault();
        setTerminalCollapsed(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const addLog = useCallback((level: LogEntry['level'], source: string, message: string) => {
    const newLog: LogEntry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
      timestamp: Date.now(),
      level,
      source,
      message
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  const handleExecute = async (intent: string) => {
    setIsRunning(true);
    setNodes({});
    setAssets([]);
    addLog('system', 'SYSTEM', `Initializing session for intent: "${intent.slice(0, 50)}..."`);
    
    try {
      const response = await startOrchestration({ intent });
      setSessionId(response.sessionId);
      addLog('success', 'SYSTEM', `Session started: ${response.sessionId}`);
      startPolling(response.sessionId);
    } catch (e) {
      setIsRunning(false);
      addLog('error', 'SYSTEM', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const startPolling = (sid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const data = await pollSessionStatus(sid);
        
        if (data.nodes) setNodes(data.nodes);
        
        if (data.logs) {
          setLogs(prev => {
            const existingIds = new Set(prev.map(l => l.id));
            const newLogs = (data.logs || []).filter(l => !existingIds.has(l.id));
            return [...prev, ...newLogs];
          });
        }
        
        if (data.assets) {
          setAssets(data.assets);
          // Auto-add to vault
          data.assets.forEach(asset => {
            setVaultFiles(prev => {
              if (prev.some(f => f.id === asset.id)) return prev;
              return [...prev, {
                id: asset.id,
                name: `${asset.title}.md`,
                type: 'document',
                size: asset.content.length,
                createdAt: asset.createdAt,
                source: asset.generatedBy,
                content: asset.content
              }];
            });
          });
        }
        
        if (data.status === 'completed') {
          stopPolling();
          setIsRunning(false);
          addLog('success', 'SYSTEM', 'Orchestration successfully completed.');
        } else if (data.status === 'error') {
          stopPolling();
          setIsRunning(false);
          addLog('error', 'SYSTEM', `Session failed: ${data.error}`);
        }
      } catch (e) {
        console.error('Polling error:', e);
      }
    }, 2000);
  };

  const stopPolling = () => {
    if (pollingRef.current) {
      clearInterval(pollingRef.current);
      pollingRef.current = null;
    }
  };

  const handleClear = () => {
    setNodes({});
    setLogs([]);
    setAssets([]);
    setSessionId(null);
    setIsRunning(false);
    stopPolling();
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  return (
    <div className="flex flex-col h-screen bg-[#0F1115] text-[#E8EAED] overflow-hidden">
      
      {/* ═══ HEADER BAR ═══ */}
      <header className="h-12 flex items-center justify-between px-4 border-b border-[rgba(255,255,255,0.08)] bg-[#1A1D23]/80 backdrop-blur-xl shrink-0 z-50">
        {/* Left: Logo */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-[#4285F4] to-[#00E5FF] flex items-center justify-center">
            <Zap size={14} className="text-white" />
          </div>
          <span className="font-display text-sm tracking-tight">
            AGENTICUM <span className="text-[#4285F4]">G5</span>
          </span>
          <span className="text-[10px] text-[#5F6368] font-mono ml-1">v1.0.0</span>
        </div>

        {/* Center: Command Bar Trigger */}
        <button 
          onClick={() => setCommandBarOpen(true)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#22262E] border border-[rgba(255,255,255,0.08)] hover:border-[#4285F4]/50 transition-all group"
        >
          <span className="text-xs text-[#9AA0A6] group-hover:text-[#E8EAED]">Search or command...</span>
          <kbd className="text-[10px] text-[#5F6368] bg-[#1A1D23] px-1.5 py-0.5 rounded">⌘K</kbd>
        </button>

        {/* Right: Status */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-4 text-[10px] font-mono text-[#5F6368]">
            <div className="flex items-center gap-1.5">
              <Cpu size={11} />
              <span>VERTEX-AI</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Database size={11} />
              <span>FIRESTORE</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Globe size={11} />
              <span>US-CENTRAL1</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <div className={`status-dot ${isRunning ? 'status-dot-running' : 'status-dot-success'}`} />
            <span className={`text-[10px] font-mono ${isRunning ? 'text-[#00E5FF]' : 'text-[#34A853]'}`}>
              {isRunning ? 'PROCESSING' : 'ONLINE'}
            </span>
          </div>
          
          <div className="text-[10px] font-mono text-[#5F6368]">
            {systemTime.toLocaleTimeString('en-GB', { hour12: false })}
          </div>
        </div>
      </header>

      {/* ═══ MAIN CONTENT ═══ */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left Sidebar */}
        <Sidebar 
          collapsed={sidebarCollapsed}
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          assets={assets}
          vaultFiles={vaultFiles}
          onFileUpload={(files: FileList) => {
            Array.from(files).forEach((file: File) => {
              const reader = new FileReader();
              reader.onload = (e) => {
                setVaultFiles(prev => [...prev, {
                  id: `upload-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                  name: file.name,
                  type: file.type.includes('image') ? 'image' : 'document',
                  size: file.size,
                  createdAt: Date.now(),
                  source: 'USER',
                  content: e.target?.result as string
                }]);
              };
              reader.readAsDataURL(file);
            });
          }}
        />

        {/* Main Canvas */}
        <main className="flex-1 flex flex-col bg-[#0F1115] overflow-hidden">
          <NodeCanvas 
            nodes={nodes}
            selectedNode={selectedNode}
            onSelectNode={setSelectedNode}
            isRunning={isRunning}
          />
        </main>

        {/* Right Inspector */}
        <Inspector 
          selectedNode={selectedNode ? nodes[selectedNode] : null}
          assets={assets}
          onClose={() => setSelectedNode(null)}
        />
      </div>

      {/* ═══ BOTTOM TERMINAL ═══ */}
      <Terminal 
        logs={logs}
        collapsed={terminalCollapsed}
        onToggle={() => setTerminalCollapsed(!terminalCollapsed)}
        onClear={() => setLogs([])}
      />

      {/* ═══ COMMAND BAR OVERLAY ═══ */}
      <CommandBar 
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onExecute={handleExecute}
        onClear={handleClear}
        isRunning={isRunning}
      />
    </div>
  );
}

export default App;
