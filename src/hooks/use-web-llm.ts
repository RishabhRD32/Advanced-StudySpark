
"use client";

import { useState, useCallback } from 'react';
import * as webllm from "@mlc-ai/web-llm";

// Standard IDs for WebLLM models
export const WEBLLM_MODELS = [
  { id: "Llama-3.2-1B-Instruct-q4f16_1-MLC", label: "Llama 3.2 1B (Fastest - Budget Devices)" },
  { id: "Llama-3.2-3B-Instruct-q4f16_1-MLC", label: "Llama 3.2 3B (Balanced)" },
  { id: "Phi-3.5-mini-instruct-q4f16_1-MLC", label: "Phi 3.5 Mini (High Quality - Requires 4GB+ RAM)" },
  { id: "Gemma-2-2b-it-q4f16_1-MLC", label: "Gemma 2 2B (Efficient)" },
  { id: "Qwen2.5-1.5B-Instruct-q4f16_1-MLC", label: "Qwen 2.5 1.5B" }
];

const DEFAULT_MODEL = "Llama-3.2-1B-Instruct-q4f16_1-MLC";

let globalEngine: webllm.MLCEngine | null = null;
let currentModelId: string | null = null;
let isInitializing = false;

export function useWebLLM() {
  const [engine, setEngine] = useState<webllm.MLCEngine | null>(globalEngine);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [hardwareWarning, setHardwareWarning] = useState<string | null>(null);

  const checkHardware = useCallback(async () => {
    // Basic check for WebGPU
    if (!navigator.gpu) {
      setError("Your browser does not support WebGPU. Local AI requires a modern browser like Chrome or Edge.");
      return false;
    }

    // Check for RAM (approximate)
    if ('deviceMemory' in navigator) {
      const ram = (navigator as any).deviceMemory;
      if (ram < 4) {
        setHardwareWarning("Your device has low memory. Local AI may run slowly or cause the browser to restart.");
      }
    }
    return true;
  }, []);

  const initEngine = async (modelId: string = DEFAULT_MODEL) => {
    const isCapable = await checkHardware();
    if (!isCapable) return null;

    if (globalEngine && currentModelId === modelId) {
      setEngine(globalEngine);
      return globalEngine;
    }

    if (globalEngine && currentModelId !== modelId) {
      setLoading(true);
      setProgress("Purging Previous Neural Core...");
      await globalEngine.unload();
      globalEngine = null;
    }
    
    if (isInitializing) {
      while (isInitializing) {
        await new Promise(r => setTimeout(r, 500));
        if (globalEngine && currentModelId === modelId) {
          setEngine(globalEngine);
          return globalEngine;
        }
      }
    }

    setLoading(true);
    setError(null);
    isInitializing = true;
    
    try {
      const newEngine = await webllm.CreateMLCEngine(modelId, {
        initProgressCallback: (report) => {
          setProgress(report.text);
        }
      });
      globalEngine = newEngine;
      currentModelId = modelId;
      setEngine(newEngine);
      setLoading(false);
      isInitializing = false;
      return newEngine;
    } catch (e: any) {
      console.error("WebLLM Init Error:", e);
      setError(e.message || "Hardware Inference Failed. This usually happens on budget devices without sufficient VRAM.");
      setLoading(false);
      isInitializing = false;
      return null;
    }
  };

  const generate = useCallback(async (prompt: string, systemPrompt?: string, modelId: string = DEFAULT_MODEL) => {
    try {
      let activeEngine = (engine || globalEngine) && currentModelId === modelId ? (engine || globalEngine) : null;
      
      if (!activeEngine) {
        activeEngine = await initEngine(modelId);
      }
      
      if (!activeEngine) return null;

      const messages: webllm.ChatCompletionMessageParam[] = [];
      if (systemPrompt) {
        messages.push({ role: "system", content: systemPrompt });
      }
      messages.push({ role: "user", content: prompt });

      const reply = await activeEngine.chat.completions.create({
        messages,
        temperature: 0.7,
        max_tokens: 1024,
      });

      return reply.choices[0].message.content;
    } catch (e: any) {
      if (e.message?.includes("Instance reference no longer exists")) {
        globalEngine = null;
        setEngine(null);
      }
      setError("Neural Link Interrupted. Device likely ran out of memory.");
      return null;
    }
  }, [engine]);

  return { generate, loading, progress, error, hardwareWarning, isReady: !!(engine || globalEngine) && currentModelId !== null };
}
