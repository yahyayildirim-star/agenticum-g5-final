export type NodeId = "SP-01" | "CC-06" | "RA-01" | "SN-00" | "DA-03";

export type NodeStatus = "idle" | "initializing" | "running" | "completed" | "error" | "awaiting_approval";

export interface NodeState {
  id: NodeId;
  name: string;
  status: NodeStatus;
  progress: number;
  startedAt?: number;
  completedAt?: number;
  output?: string;
  error?: string;
}

export interface OrchestrationRequest {
  intent: string;
  sessionId?: string;
}

export interface OrchestrationResponse {
  sessionId: string;
  status: "started" | "running" | "completed" | "error" | "awaiting_approval";
  nodes: Record<string, NodeState>;
  executionPlan?: string[];
  finalResult?: string;
  logs?: LogEntry[];
  assets?: GeneratedAsset[];
  metadata?: any;
  error?: string;
}

export type LogLevel = "info" | "success" | "warning" | "error" | "system" | "node";

export interface LogEntry {
  id: string;
  timestamp: number;
  level: LogLevel;
  source: string;
  message: string;
}

export interface GeneratedAsset {
  id: string;
  type: "strategy" | "video_prompt" | "research_report" | "full_campaign" | "design_blueprint";
  title: string;
  content: string;
  generatedBy: string;
  createdAt: number;
  imageData?: {
    url?: string;        // Cloud Storage URL (new)
    base64?: string;     // Legacy base64
    mimeType?: string;   // Legacy mime type
    prompt: string;
  };
}

export type VaultFileType = "document" | "image" | "video" | "audio" | "data";

export interface VaultFile {
  id: string;
  name: string;
  type: VaultFileType;
  size: number;
  createdAt: number;
  source: string;
  content?: string;
  url?: string;
}

export type WindowType = "asset_preview" | "document_editor" | "system_monitor";

export interface OmniWindow {
  id: string;
  type: WindowType;
  title: string;
  zIndex: number;
  isMinimized: boolean;
  data: any;
}
