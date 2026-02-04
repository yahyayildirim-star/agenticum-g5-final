import { useState, useEffect, useRef, useCallback } from 'react';
import { 
  Sidebar, 
  CommandBar, 
  NodeCanvas, 
  Inspector, 
  Terminal, 
  BrandHub, 
  PerformanceMetrics, 
  AuditLogViewer, 
  DistributionHub, 
  SystemSettings, 
  TelemetryDashboard,
  type SystemTelemetry,
  FileVault,
  OmniWindow as OmniWindowComp,
  AssetPreview,
  NeuralMeshBackground,
  OSOverlay,
  ProtocolLock
} from './components';
import { startOrchestration, pollSessionStatus, resumeOrchestration } from './lib/api';
import type { NodeState, LogEntry, GeneratedAsset, VaultFile, OrchestrationResponse, OmniWindow, WindowType } from './lib/types';
import { Cpu, Zap, Database, CheckCircle, XCircle, Terminal as TerminalIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

function App() {
  // Core State
  const [isRunning, setIsRunning] = useState(false);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [nodes, setNodes] = useState<Record<string, NodeState>>({});
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [assets, setAssets] = useState<GeneratedAsset[]>([]);
  const [vaultFiles, setVaultFiles] = useState<VaultFile[]>([]);
  
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [terminalCollapsed, setTerminalCollapsed] = useState(false);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [commandBarOpen, setCommandBarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [systemTime, setSystemTime] = useState(new Date());
  const [activeTab, setActiveTab] = useState<'nodes' | 'terminal'| 'vault' | 'brand' | 'audit' | 'distribution' | 'telemetry'>('nodes');
  const [isAwaitingApproval, setIsAwaitingApproval] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const [telemetryStats, setTelemetryStats] = useState<SystemTelemetry | undefined>(undefined);
  const [windows, setWindows] = useState<OmniWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [protocolLock, setProtocolLock] = useState<{ active: boolean; actionName: string; onConfirm: () => void } | null>(null);
  
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ════ SUBSTRATE MEMORY (PERSISTENCE) ════
  useEffect(() => {
    const savedVault = localStorage.getItem('g5_vault');
    const savedAssets = localStorage.getItem('g5_assets');
    const savedLogs = localStorage.getItem('g5_logs');
    
    if (savedVault) setVaultFiles(JSON.parse(savedVault));
    if (savedAssets) setAssets(JSON.parse(savedAssets));
    if (savedLogs) setLogs(JSON.parse(savedLogs));

    // Initialize Branding
    const primary = localStorage.getItem('g5_brand_primary');
    const secondary = localStorage.getItem('g5_brand_secondary');
    if (primary) document.documentElement.style.setProperty('--brand-primary', primary);
    if (secondary) document.documentElement.style.setProperty('--brand-secondary', secondary);
    if (primary) document.documentElement.style.setProperty('--brand-glow', `${primary}66`);
  }, []);

  useEffect(() => {
    localStorage.setItem('g5_vault', JSON.stringify(vaultFiles));
  }, [vaultFiles]);

  useEffect(() => {
    localStorage.setItem('g5_assets', JSON.stringify(assets));
  }, [assets]);

  useEffect(() => {
    localStorage.setItem('g5_logs', JSON.stringify(logs));
  }, [logs]);

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

  // ════ WINDOW MANAGEMENT ════
  const openWindow = (type: WindowType, title: string, data: GeneratedAsset) => {
    const id = `win-${Math.random().toString(36).substr(2, 9)}`;
    const maxZ = windows.length > 0 ? Math.max(...windows.map(w => w.zIndex)) : 100;
    const newWindow: OmniWindow = {
      id,
      type,
      title,
      zIndex: maxZ + 1,
      isMinimized: false,
      data
    };
    setWindows(prev => [...prev, newWindow]);
    setActiveWindowId(id);
  };

  const closeWindow = (id: string) => {
    setWindows(prev => prev.filter(w => w.id !== id));
    if (activeWindowId === id) setActiveWindowId(null);
  };

  const focusWindow = (id: string) => {
    setWindows(prev => {
      const currentMaxZ = prev.length > 0 ? Math.max(...prev.map(w => w.zIndex)) : 100;
      return prev.map(w => w.id === id ? { ...w, zIndex: currentMaxZ + 1 } : w);
    });
    setActiveWindowId(id);
  };

  const triggerNeuralDialogue = useCallback(() => {
    const dialoguePool = [
      { source: 'ORCHESTRATOR', message: "Neural substrate analysis complete. Initiating multi-channel sync." },
      { source: 'STRATEGIST', message: "Wait. I'm seeing a 14% deviation in audience sentiment patterns. We should recalibrate the visual anchors." },
      { source: 'AUDITOR', message: "Security check passed. Sentiment recalibration is approved within safety parameters." },
      { source: 'ORCHESTRATOR', message: "Copy that. Pushing recalibrated tokens to the generation nodes." },
      { source: 'STRATEGIST', message: "The aesthetic raw-mode is performing better in simulation. Let's pivot to high-contrast imagery." }
    ];

    dialoguePool.forEach((d, i) => {
      setTimeout(() => {
        addLog('info', d.source, d.message);
        // Persist to Audit Trail
        const auditEntry: VaultFile = {
            id: `audit-${Date.now()}-${i}`,
            name: `SYNERGY_DEBATE_${i}.json`,
            type: 'document',
            size: d.message.length,
            createdAt: Date.now(),
            source: d.source,
            content: JSON.stringify({
                type: 'NEURAL_SYNERGY',
                event: d.message,
                agent: d.source,
                timestamp: new Date().toISOString()
            }, null, 2)
        };
        setVaultFiles(prev => [...prev, auditEntry]);
      }, (i + 1) * 3500);
    });
  }, [addLog]);

  const handleExecute = async (intent: string) => {
    setIsRunning(true);
    setIsAwaitingApproval(false);
    setNodes({});
    setAssets([]);
    setActiveTab('nodes');
    addLog('system', 'SYSTEM', `Initializing session for intent: "${intent.slice(0, 50)}..."`);
    
    try {
      const response = await startOrchestration({ intent });
      setSessionId(response.sessionId);
      addLog('success', 'SYSTEM', `Session started: ${response.sessionId}`);
      startPolling(response.sessionId);
      
      // Trigger synergistic dialogue after a short delay
      setTimeout(triggerNeuralDialogue, 2000);
    } catch (e) {
      setIsRunning(false);
      addLog('error', 'SYSTEM', e instanceof Error ? e.message : 'Unknown error');
    }
  };

  const handleResume = async (approved: boolean) => {
    if (!sessionId) return;
    setIsResuming(true);
    addLog('system', 'HITL', approved ? 'Strategie genehmigt. Setze Ausführung fort...' : 'Abbruch durch Benutzer.');
    
    try {
      if (approved) {
        await resumeOrchestration(sessionId, { approved: true });
        setIsAwaitingApproval(false);
      } else {
        handleClear();
      }
    } catch (e) {
      addLog('error', 'SYSTEM', `Fehler beim Fortsetzen: ${e instanceof Error ? e.message : 'Unbekannt'}`);
    } finally {
      setIsResuming(false);
    }
  };

  const startPolling = (sid: string) => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    
    pollingRef.current = setInterval(async () => {
      try {
        const data: OrchestrationResponse = await pollSessionStatus(sid);
        
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

        const perfMetadata = (data as OrchestrationResponse).metadata?.performance;
        if (perfMetadata) {
          setTelemetryStats(perfMetadata as SystemTelemetry);
        }
        
        if (data.status === 'awaiting_approval') {
          setIsAwaitingApproval(true);
        } else if (data.status === 'completed') {
          stopPolling();
          setIsRunning(false);
          setIsAwaitingApproval(false);
          addLog('success', 'SYSTEM', 'Orchestration successfully completed.');
        } else if (data.status === 'error') {
          stopPolling();
          setIsRunning(false);
          setIsAwaitingApproval(false);
          addLog('error', 'SYSTEM', `Session failed: ${data.error}`);
        } else if (data.status === 'running') {
          setIsAwaitingApproval(false);
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
    setProtocolLock({
      active: true,
      actionName: 'WORKSPACE_PURGE',
      onConfirm: () => {
        setNodes({});
        setLogs([]);
        setAssets([]);
        setSessionId(null);
        setIsRunning(false);
        setIsAwaitingApproval(false);
        stopPolling();
        localStorage.removeItem('g5_vault');
        localStorage.removeItem('g5_assets');
        localStorage.removeItem('g5_logs');
        setProtocolLock(null);
        addLog('info', 'SYSTEM', 'Substrate memory purged successfully.');
      }
    });
  };

  useEffect(() => {
    return () => stopPolling();
  }, []);

  const handleRegenerateNode = useCallback(async (nodeId: string) => {
    setProtocolLock({
      active: true,
      actionName: 'NEURAL_OVERRIDE',
      onConfirm: () => {
        addLog('info', 'SYSTEM', `Neural override initiated for node: ${nodeId}`);
        setProtocolLock(null);
        // Trigger simulation of regeneration
        setTimeout(() => {
          addLog('success', 'SYSTEM', `Node ${nodeId} recalibrated into new state cluster.`);
        }, 2000);
      }
    });
  }, [addLog]);

  return (
    <div className="flex flex-col h-screen bg-[#0A0E14] text-[#E8EAED] font-sans selection:bg-[#4285F4]/30">
      <NeuralMeshBackground stats={telemetryStats} />
      
      <OSOverlay systemTime={systemTime} sessionId={sessionId || 'STANDBY'} />

      <div className="flex flex-1 overflow-hidden relative z-10">
        <Sidebar 
          collapsed={sidebarCollapsed} 
          onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
          activeTab={activeTab}
          onTabChange={(tab: any) => setActiveTab(tab)}
          assets={assets}
          vaultFiles={vaultFiles}
          onFileUpload={(file: any) => setVaultFiles(prev => [...prev, file])}
          onOpenSettings={() => setSettingsOpen(true)}
        />

        <main className="flex-1 flex flex-col min-w-0 bg-transparent relative">
          <AnimatePresence mode="wait">
            {activeTab === 'nodes' && (
              <NodeCanvas key="nodes" nodes={nodes} onSelectNode={setSelectedNode} />
            )}

            {activeTab === 'vault' && (
              <FileVault 
                key="vault" 
                files={vaultFiles} 
                onOpenFile={(f: any) => openWindow('asset_preview', f.name, { ...f, title: f.name, id: f.id, createdAt: f.createdAt, generatedBy: f.source })} 
              />
            )}

            {activeTab === 'brand' && (
              <BrandHub key="brand" />
            )}

            {activeTab === 'audit' && (
              <AuditLogViewer 
                key="audit"
                logs={vaultFiles
                  .filter(f => f.name.startsWith('SYNERGY_DEBATE'))
                  .map(f => {
                    const data = JSON.parse(f.content);
                    return {
                      id: f.id,
                      type: 'OPERATIONAL',
                      action: 'NEURAL_SYNERGY',
                      actor: data.agent || 'SYSTEM',
                      timestamp: { _seconds: f.createdAt / 1000 },
                      details: { event: data.event || 'No data' }
                    } as any;
                  })
                }
                onExport={() => addLog('success', 'SYSTEM', 'Intelligence package generation initiated.')}
              />
            )}

            {activeTab === 'distribution' && (
              <DistributionHub key="distribution" />
            )}

            {activeTab === 'telemetry' && (
              <TelemetryDashboard key="telemetry" />
            )}
          </AnimatePresence>

          {/* Inspector Overlay */}
          <AnimatePresence>
            {selectedNode && nodes[selectedNode] && (
              <Inspector 
                node={nodes[selectedNode]} 
                onClose={() => setSelectedNode(null)} 
                onRegenerate={handleRegenerateNode}
              />
            )}
          </AnimatePresence>

          {/* Settings Modal */}
          <AnimatePresence>
            {settingsOpen && (
              <SystemSettings onClose={() => setSettingsOpen(false)} />
            )}
          </AnimatePresence>

          {/* Omni Windows */}
          {windows.map(win => (
            <OmniWindowComp
              key={win.id}
              id={win.id}
              title={win.title}
              zIndex={win.zIndex}
              isActive={activeWindowId === win.id}
              onClose={() => closeWindow(win.id)}
              onFocus={() => focusWindow(win.id)}
            >
              {win.type === 'asset_preview' && <AssetPreview asset={win.data} />}
            </OmniWindowComp>
          ))}

          <Terminal 
            logs={logs} 
            collapsed={terminalCollapsed}
            onToggle={() => setTerminalCollapsed(!terminalCollapsed)}
            onClear={() => setLogs([])}
          />

          {/* ═══ HITL ACTION CENTER ═══ */}
          <AnimatePresence>
            {isAwaitingApproval && (
              <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 50 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[500px] bg-[#1A1D23] border border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.1)] rounded-xl p-6 z-[100] backdrop-blur-xl"
              >
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-[#FFD700]/10 rounded-lg text-[#FFD700]">
                      <CheckCircle size={20} />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-[#E8EAED]">Review erforderlich</h3>
                      <p className="text-[10px] text-[#9AA0A6]">Plan erstellt. Bitte prüfen und freigeben.</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <button 
                      onClick={() => handleResume(true)}
                      disabled={isResuming}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-[#FFD700]/10 hover:bg-[#FFD700]/20 text-[#FFD700] rounded-lg transition-all text-xs font-bold"
                    >
                      {isResuming ? 'SENDING...' : 'STRATEGIE FREIGEBEN'}
                    </button>
                    <button 
                      onClick={() => handleResume(false)}
                      disabled={isResuming}
                      className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg transition-all"
                    >
                      <XCircle size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <CommandBar 
        isOpen={commandBarOpen}
        onClose={() => setCommandBarOpen(false)}
        onExecute={handleExecute}
        onClear={handleClear}
        isRunning={isRunning}
      />

      {/* Protocol Lock Overlay */}
      <AnimatePresence>
        {protocolLock?.active && (
          <ProtocolLock 
            actionName={protocolLock.actionName}
            onSuccess={protocolLock.onConfirm}
            onCancel={() => setProtocolLock(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

export default App;
