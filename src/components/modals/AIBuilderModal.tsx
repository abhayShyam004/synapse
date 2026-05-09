import { useState, useEffect, useRef } from 'react';
import { useSynapseStore } from '../../store/useSynapseStore';
import { X, Sparkles, Send, Loader2, User, Bot } from 'lucide-react';
import { clsx } from 'clsx';
import { fetchAISuggestion } from '../../lib/ai/nvidiaNim';
import toast from 'react-hot-toast';
import { useReactFlow } from '@xyflow/react';

interface Message {
  role: 'ai' | 'user';
  content: string;
  options?: string[];
  isFinal?: boolean;
}

/**
 * Robust JSON extraction that handles markdown blocks, conversational text, and gracefully heals syntax errors.
 */
const extractJSON = (str: string) => {
  let cleaned = str.replace(/```json\n?|\n?```/g, '').trim();
  const startIdx = cleaned.indexOf('{');
  if (startIdx !== -1) cleaned = cleaned.substring(startIdx);

  try {
    return JSON.parse(cleaned);
  } catch (e) {
    const stack: ('{' | '[' | '"')[] = [];
    let isEscaped = false;
    let validOutput = "";

    for (let i = 0; i < cleaned.length; i++) {
      const char = cleaned[i];
      
      if (stack[stack.length - 1] === '"') {
        validOutput += char;
        if (isEscaped) {
          isEscaped = false;
        } else if (char === '\\') {
          isEscaped = true;
        } else if (char === '"') {
          stack.pop();
        }
        continue;
      }

      if (char === '"') {
        stack.push('"');
      } else if (char === '{') {
        stack.push('{');
      } else if (char === '[') {
        stack.push('[');
      } else if (char === '}') {
        if (stack[stack.length - 1] === '{') {
          stack.pop();
        } else {
          // Extra closing brace, skip it
          continue; 
        }
      } else if (char === ']') {
        if (stack[stack.length - 1] === '[') {
          stack.pop();
        } else {
          // Extra closing bracket, skip it
          continue;
        }
      }
      validOutput += char;
    }

    // Auto-close any open structures
    while (stack.length > 0) {
      const last = stack.pop();
      if (last === '"') {
        validOutput += '"';
      } else if (last === '{') {
        validOutput += '}';
      } else if (last === '[') {
        validOutput += ']';
      }
    }

    // Remove trailing commas before closing brackets/braces
    validOutput = validOutput.replace(/,\s*([}\]])/g, '$1');

    try {
      return JSON.parse(validOutput);
    } catch (e2) {
      console.error('Failed to parse and repair AI response:', validOutput);
      throw new Error('Invalid JSON format from AI');
    }
  }
};

export const AIBuilderModal = () => {
  const { isAIBuilderOpen, setAIBuilderOpen, addNode, onConnect, nodes, currentWorkflowId } = useSynapseStore();
  const { fitView } = useReactFlow();
  
  const [messages, setMessages] = useState<Message[]>([
    { 
      role: 'ai', 
      content: "Hi! Let's build your workflow together. What are you trying to automate or plan? Describe your goal in a sentence or two.",
      options: ["Get a software dev job", "Build a side project", "Learn for interviews", "Career switch to tech"]
    }
  ]);
  
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [questionCount, setQuestionCount] = useState(1);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking, isGenerating]);

  if (!isAIBuilderOpen) return null;

  const handleSend = async (text?: string) => {
    const messageText = text || input.trim();
    if (!messageText || isThinking || isGenerating) return;

    const userMessage: Message = { role: 'user', content: messageText };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setInput('');
    
    if (questionCount >= 3) {
      const finalAIMessage: Message = {
        role: 'ai',
        content: "Perfect, I have everything I need! Ready to build your detailed workflow?",
        isFinal: true
      };
      setMessages([...newMessages, finalAIMessage]);
      return;
    }

    setIsThinking(true);

    try {
      const systemPrompt = `You are a workflow builder assistant. Gather ONLY minimum info for a workflow.
Ask MAXIMUM 3 short questions total, one at a time.

Turn status: Question ${questionCount + 1} of 3.

Current conversation:
${newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

INSTRUCTIONS:
1. Return ONLY valid JSON: { "message": "string", "options": ["string", "string"], "readyToGenerate": boolean }
2. NO conversational text outside the JSON.
3. If this is question 3, set "readyToGenerate": true.
4. Always provide 2-4 chips in "options".`;

      const aiResponse = await fetchAISuggestion(systemPrompt, 'meta/llama-3.1-8b-instruct');
      const parsed = extractJSON(aiResponse);
      
      const aiMessage: Message = {
        role: 'ai',
        content: parsed.message || "Something went wrong, but I think I'm ready.",
        options: parsed.options || [],
        isFinal: !!parsed.readyToGenerate || questionCount >= 2
      };

      setMessages([...newMessages, aiMessage]);
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error('AI is having trouble. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    
    const summaryPrompt = `Summarize this workflow conversation in 2-3 sentences:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;

    try {
      const summary = await fetchAISuggestion(summaryPrompt, 'meta/llama-3.1-8b-instruct');
      
      const generationPrompt = `You are a workflow architect AI. Generate a detailed, specific, branching workflow.

User's goal summary: ${summary}

STRICT RULES:
- Generate exactly 20-30 nodes.
- Every node must have a SPECIFIC, DETAILED name and description — no vague names.
- Use Decision nodes to create real branching paths (Yes/No).
- Every node must be connected — no orphan nodes.
- Node types: trigger, task, decision, condition, aiPrompt, timer, variable, loop, note.
- Positions: start at x:400 y:50, increment y by 160 per level, branches go x:200 (left) and x:650 (right), merges return to x:400.

For a CS/interview/job preparation goal specifically:
- Include separate nodes for each DSA topic (arrays, linked lists, trees, graphs, DP, etc.) with specific LeetCode problem numbers.
- Include OS, CN, DBMS, OOP as separate detailed nodes.
- Include backend framework nodes if mentioned.
- Include mock interview, system design, resume nodes.
- Use Decision nodes to branch beginner vs advanced paths.

Return ONLY this JSON, nothing else, no markdown, no explanation:
{"nodes":[{"id":"n1","type":"trigger","name":"...","description":"...","position":{"x":400,"y":50}}],"edges":[{"id":"e1","source":"n1","target":"n2","label":"Yes"}]}`;

      let result;
      try {
        result = await fetchAISuggestion(generationPrompt, 'meta/llama-3.3-70b-instruct');
      } catch (e) {
        console.warn("70B failed, retrying once with simpler prompt...");
        result = await fetchAISuggestion("Fix this JSON for a workflow: " + generationPrompt, 'meta/llama-3.3-70b-instruct');
      }

      const parsed = extractJSON(result);
      
      // 1. Validation & Auto-Correction
      const validNodes = (parsed.nodes || []).filter((n: any) => n.id && n.type);
      const validNodeIds = new Set(validNodes.map((n: any) => n.id));
      let validEdges = (parsed.edges || []).filter((e: any) => validNodeIds.has(e.source) && validNodeIds.has(e.target));

      // Ensure every node has at least one connection
      validNodes.forEach((node: any, idx: number) => {
        const hasEdge = validEdges.some((e: any) => e.source === node.id || e.target === node.id);
        if (!hasEdge && idx > 0) {
          validEdges.push({
            id: `e-fix-${idx}-${crypto.randomUUID().slice(0,4)}`,
            source: validNodes[idx-1].id,
            target: node.id
          });
        }
      });

      // 2. Auto-Layout Pass (Level-based spacing)
      const nodesByY: Record<number, any[]> = {};
      validNodes.forEach((n: any) => {
        const y = n.position?.y || 0;
        if (!nodesByY[y]) nodesByY[y] = [];
        nodesByY[y].push(n);
      });

      Object.keys(nodesByY).forEach(yStr => {
        const yNodes = nodesByY[Number(yStr)];
        const count = yNodes.length;
        if (count > 1) {
          const totalWidth = 600;
          const startX = 400 - (totalWidth / 2);
          const gap = totalWidth / (count - 1);
          yNodes.forEach((n, i) => {
            n.position.x = startX + (i * gap);
          });
        } else if (count === 1) {
          yNodes[0].position.x = 400;
        }
      });

      // 3. Canvas Placement
      const rightmostExistingX = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.x)) : -200;
      const xOffset = rightmostExistingX + 400;

      validNodes.forEach((n: any) => {
        addNode({
          id: `${currentWorkflowId || 'ai'}-${n.id}-${crypto.randomUUID().slice(0, 4)}`,
          type: 'custom',
          position: {
            x: (n.position?.x || 400) + xOffset,
            y: n.position?.y || 100
          },
          data: { 
            label: n.name, 
            type: n.type.charAt(0).toUpperCase() + n.type.slice(1), 
            description: n.description,
            expanded: true,
            shape: 'rounded'
          }
        });
      });

      // Add Edges
      setTimeout(() => {
        validEdges.forEach((e: any) => {
          onConnect({ 
            source: nodes.find(existing => existing.id.includes(e.source))?.id || `${currentWorkflowId || 'ai'}-${e.source}`, 
            target: nodes.find(existing => existing.id.includes(e.target))?.id || `${currentWorkflowId || 'ai'}-${e.target}`,
            sourceHandle: null, targetHandle: null,
            label: e.label
          } as any);
        });
        
        setTimeout(() => {
          fitView({ padding: 0.15, duration: 800 });
        }, 300);
      }, 600);

      toast.success(`✦ Workflow generated — ${validNodes.length} nodes added`);
      setAIBuilderOpen(false);
      setMessages([{ 
        role: 'ai', 
        content: "Hi! Let's build your workflow together. What are you trying to automate or plan? Describe your goal in a sentence or two.",
        options: ["Get a software dev job", "Build a side project", "Learn for interviews", "Career switch to tech"]
      }]);
      setQuestionCount(1);
    } catch (error) {
      console.error(error);
      toast.error('AI Architect failed to generate the structure. Please try a different goal.');
    } finally {
      setIsGenerating(false);
    }
  };

  const lastAIMessage = [...messages].reverse().find(m => m.role === 'ai');

  return (
    <>
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
           <div className="w-16 h-16 border-4 border-gray-100 rounded-full border-t-[var(--accent)] animate-spin mb-6" />
           <div className="flex flex-col items-center text-center px-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Architecting your workflow...</h2>
              <p className="text-gray-400 text-sm max-w-xs">Using Llama 70B to design your branching path</p>
           </div>
        </div>
      )}

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/40 backdrop-blur-[2px] p-4" onClick={() => setAIBuilderOpen(false)}>
        <div className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50">
            <h2 className="font-bold text-gray-900 flex items-center gap-2"><Sparkles size={18} className="text-[var(--accent)]" /> Build with AI</h2>
            <button onClick={() => setAIBuilderOpen(false)} className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded-md"><X size={20} /></button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gray-50/30">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div className={clsx("flex gap-3 max-w-[85%]", m.role === 'user' ? "self-end flex-row-reverse" : "self-start")}>
                  <div className={clsx("w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm", m.role === 'ai' ? "bg-white text-[var(--accent)] border border-gray-100" : "bg-[var(--accent)] text-white")}>
                    {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={clsx("p-3.5 rounded-2xl text-[13px] shadow-sm", m.role === 'ai' ? "bg-white text-gray-700 rounded-tl-none border border-gray-100" : "bg-[var(--accent)] text-white rounded-tr-none")}>
                    {m.content}
                  </div>
                </div>

                {!isThinking && !isGenerating && m === lastAIMessage && (
                  <div className="flex flex-wrap gap-2 ml-11 max-w-[85%]">
                    {m.isFinal ? (
                      <button onClick={handleGenerate} className="px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2" style={{ backgroundColor: 'var(--accent)' }}><Sparkles size={16} /> Generate My Workflow</button>
                    ) : (
                      m.options?.map(opt => <button key={opt} onClick={() => handleSend(opt)} className="bg-white border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm">{opt}</button>)
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isThinking && (
              <div className="self-start flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[var(--accent)] flex items-center justify-center shadow-sm border border-gray-100"><Bot size={16} /></div>
                <div className="bg-white border border-gray-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center justify-center min-w-[60px]">
                  <div className="flex gap-1.5">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.2s]" />
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce [animation-duration:0.8s] [animation-delay:0.4s]" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div className="p-4 bg-white border-t border-gray-100">
            <div className="flex gap-2">
              <input autoFocus value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Type your answer..." disabled={isThinking || isGenerating} className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 outline-none" />
              <button onClick={() => handleSend()} disabled={!input.trim() || isThinking || isGenerating} className="w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all" style={{ backgroundColor: input.trim() ? 'var(--accent)' : '#E5E7EB' }}>
                {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
