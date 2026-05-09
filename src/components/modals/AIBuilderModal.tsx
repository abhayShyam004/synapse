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
 * Utility to extract JSON from a string that might contain other text.
 */
const extractJSON = (str: string) => {
  try {
    const match = str.match(/\{[\s\S]*\}/);
    if (match) return JSON.parse(match[0]);
    return JSON.parse(str);
  } catch (e) {
    throw new Error('Invalid JSON format');
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
    
    // Hard limit: if we already asked 3 questions, we force termination
    if (questionCount >= 3) {
      const finalAIMessage: Message = {
        role: 'ai',
        content: "Perfect, I have everything I need! Ready to build your workflow?",
        isFinal: true
      };
      setMessages([...newMessages, finalAIMessage]);
      return;
    }

    setIsThinking(true);

    try {
      const systemPrompt = `You are a workflow builder assistant. Your job is to gather ONLY the minimum information needed to build a workflow. 
Ask MAXIMUM 3 short questions total, one at a time. 

Current question index: ${questionCount + 1}/3.

Questions to ask in order:
1. What is your goal? (already asked if index > 1)
2. What is your current level? (with 4 options)
3. What is your timeline? (with 4 options)

After the 3rd answer, respond with: { "message": "Perfect, I have everything I need!", "options": [], "readyToGenerate": true }

RULES:
1. Return ONLY valid JSON: { "message": "string", "options": ["string", "string"], "readyToGenerate": boolean }
2. NO conversational filler outside the JSON.
3. Never ask more than 3 questions.
4. Keep messages short.

Conversation so far:
${newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`;

      const aiResponse = await fetchAISuggestion(systemPrompt);
      const parsed = extractJSON(aiResponse);
      
      const aiMessage: Message = {
        role: 'ai',
        content: parsed.message,
        options: parsed.options,
        isFinal: !!parsed.readyToGenerate
      };

      setMessages([...newMessages, aiMessage]);
      setQuestionCount(prev => prev + 1);
    } catch (error) {
      console.error(error);
      toast.error('AI is having trouble responding. Please try again.');
    } finally {
      setIsThinking(false);
    }
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    try {
      const prompt = `Based on this conversation:
${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

Generate a complete, high-quality, and contextually RELEVANT workflow as JSON. Return ONLY valid JSON, no other text.
The workflow should be a detailed step-by-step path (study plan or automation flow) based on the user's goal.

Structure:
{
  "nodes": [{ "id": "1", "type": "task|trigger|decision|condition|aiPrompt|timer|variable|loop|note", "name": "Human Readable Name", "description": "Brief step details" }],
  "edges": [{ "source": "1", "target": "2" }]
}

Guidelines:
- Space nodes vertically 160px apart.
- Horizontally centered around x:500.
- Connect them linearly top to bottom.
- Use ONLY these types: task, trigger, decision, condition, aiPrompt, timer, variable, loop, note.
- Use specific, meaningful node names.
- Do not explain anything. Just JSON.`;

      const result = await fetchAISuggestion(prompt);
      const parsed = extractJSON(result);

      // Find rightmost node to offset
      const rightmostX = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.x)) : 0;
      const xOffset = nodes.length > 0 ? rightmostX + 300 : 0;

      // Add nodes
      parsed.nodes.forEach((n: any, index: number) => {
        addNode({
          id: `${currentWorkflowId || 'ai'}-${n.id}`,
          type: 'custom',
          position: { x: xOffset + 500, y: (index * 160) + 100 },
          data: { 
            label: n.name, 
            type: n.type.charAt(0).toUpperCase() + n.type.slice(1), 
            description: n.description,
            expanded: true,
            shape: 'rounded'
          }
        });
      });

      // Add edges
      setTimeout(() => {
        parsed.edges.forEach((e: any) => {
          onConnect({ 
            source: `${currentWorkflowId || 'ai'}-${e.source}`, 
            target: `${currentWorkflowId || 'ai'}-${e.target}`,
            sourceHandle: null,
            targetHandle: null
          });
        });
        fitView({ duration: 800 });
      }, 500);

      toast.success(`Workflow generated! ${parsed.nodes.length} nodes added.`);
      setAIBuilderOpen(false);
      
      // Reset state for next time
      setMessages([{ 
        role: 'ai', 
        content: "Hi! Let's build your workflow together. What are you trying to automate or plan? Describe your goal in a sentence or two.",
        options: ["Get a software dev job", "Build a side project", "Learn for interviews", "Career switch to tech"]
      }]);
      setQuestionCount(1);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong during generation. Try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const lastAIMessage = [...messages].reverse().find(m => m.role === 'ai');

  return (
    <>
      {/* Full-screen Loading State for Generation */}
      {isGenerating && (
        <div className="fixed inset-0 z-[200] bg-white flex flex-col items-center justify-center animate-in fade-in duration-500">
          <div className="flex flex-col items-center gap-6">
            <div className="relative">
               <div className="w-16 h-16 border-4 border-gray-100 rounded-full border-t-[var(--accent)] animate-spin" />
               <Sparkles className="absolute inset-0 m-auto text-[var(--accent)] animate-pulse" size={24} />
            </div>
            <div className="flex flex-col items-center">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Building your workflow...</h2>
              <p className="text-gray-400 text-sm">Synthesizing personalized path and connections</p>
            </div>
          </div>
        </div>
      )}

      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#000000]/40 backdrop-blur-[2px] p-4" onClick={() => setAIBuilderOpen(false)}>
        <div 
          className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-200 animate-in zoom-in-95 duration-200"
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-gray-50/50 shrink-0">
            <h2 className="font-bold text-gray-900 flex items-center gap-2">
              <Sparkles size={18} className="text-[var(--accent)]" /> Build with AI
            </h2>
            <button 
              onClick={() => setAIBuilderOpen(false)} 
              className="text-gray-400 hover:text-gray-700 transition-colors p-1 hover:bg-gray-100 rounded-md"
            >
              <X size={20} />
            </button>
          </div>

          {/* Chat Area */}
          <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-gray-50/30">
            {messages.map((m, i) => (
              <div key={i} className="flex flex-col gap-3">
                <div 
                  className={clsx(
                    "flex gap-3 max-w-[85%]",
                    m.role === 'user' ? "self-end flex-row-reverse" : "self-start"
                  )}
                >
                  <div className={clsx(
                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                    m.role === 'ai' ? "bg-white text-[var(--accent)] border border-gray-100" : "bg-[var(--accent)] text-white"
                  )}>
                    {m.role === 'ai' ? <Bot size={16} /> : <User size={16} />}
                  </div>
                  <div className={clsx(
                    "p-3.5 rounded-2xl text-[13px] leading-relaxed shadow-sm",
                    m.role === 'ai' ? "bg-white text-gray-700 rounded-tl-none border border-gray-100" : "bg-[var(--accent)] text-white rounded-tr-none"
                  )}>
                    {m.content}
                  </div>
                </div>

                {/* Suggested Options Chips or Generate Button */}
                {!isThinking && !isGenerating && m === lastAIMessage && (
                  <div className="flex flex-wrap gap-2 ml-11 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                    {m.isFinal ? (
                      <button
                        onClick={handleGenerate}
                        style={{ backgroundColor: 'var(--accent)' }}
                        className="px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2 active:scale-95"
                      >
                        <Sparkles size={16} /> Generate My Workflow
                      </button>
                    ) : (
                      m.options?.map(opt => (
                        <button
                          key={opt}
                          onClick={() => handleSend(opt)}
                          className="bg-white border border-[var(--accent)] text-[var(--accent)] px-4 py-2 rounded-lg text-xs font-semibold hover:bg-[var(--accent)] hover:text-white transition-all shadow-sm active:scale-95"
                        >
                          {opt}
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>
            ))}
            
            {isThinking && (
              <div className="self-start flex gap-3">
                <div className="w-8 h-8 rounded-full bg-white text-[var(--accent)] flex items-center justify-center shadow-sm border border-gray-100">
                  <Bot size={16} />
                </div>
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

          {/* Input Area */}
          <div className="p-4 bg-white border-t border-gray-100 shrink-0">
            <div className="flex gap-2">
              <input 
                autoFocus
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSend()}
                placeholder="Type your answer..."
                disabled={isThinking || isGenerating}
                className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-[var(--accent)]/10 transition-all disabled:bg-gray-50"
              />
              <button 
                onClick={() => handleSend()}
                disabled={!input.trim() || isThinking || isGenerating}
                style={{ backgroundColor: input.trim() ? 'var(--accent)' : '#E5E7EB' }}
                className={clsx(
                  "w-10 h-10 rounded-xl flex items-center justify-center text-white transition-all",
                  input.trim() ? "shadow-md hover:scale-105" : "cursor-not-allowed"
                )}
              >
                {isThinking ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
