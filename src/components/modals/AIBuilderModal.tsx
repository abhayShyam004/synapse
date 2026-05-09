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
}

export const AIBuilderModal = () => {
  const { isAIBuilderOpen, setAIBuilderOpen, addNode, onConnect, nodes } = useSynapseStore();
  const { fitView } = useReactFlow();
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: "Hi! Let's build your workflow together. What are you trying to automate or plan? Describe your goal in a sentence or two." }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isThinking]);

  if (!isAIBuilderOpen) return null;

  const handleSend = async () => {
    if (!input.trim() || isThinking) return;

    const userMessage = input.trim();
    const newMessages = [...messages, { role: 'user', content: userMessage }];
    setMessages(newMessages as Message[]);
    setInput('');
    setIsThinking(true);

    try {
      const prompt = `You are a workflow planning assistant. We are having a conversation to build a workflow.
Conversation so far:
${newMessages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}

If you have enough information to generate a workflow (goal, steps, conditions), say exactly: "Great, I have everything I need. Ready to generate your workflow?".
Otherwise, ask exactly one follow-up question to clarify the user's needs (goal, node types, flow, conditions, or variables).`;

      const aiResponse = await fetchAISuggestion(prompt);
      setMessages([...newMessages, { role: 'ai', content: aiResponse }] as Message[]);
    } catch (error) {
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

Generate a complete workflow as JSON. Return ONLY valid JSON, no other text.
The JSON must follow this structure:
{
  "nodes": [{ "id": "unique-id", "type": "task|trigger|decision|condition|aiPrompt|timer|variable|loop|note", "name": "Human Readable Name", "description": "Brief description" }],
  "edges": [{ "source": "node-id", "target": "node-id" }]
}

Guidelines:
- Space nodes vertically 150px apart.
- Horizontally centered around x:400.
- Use ONLY these types: task, trigger, decision, condition, aiPrompt, timer, variable, note.
- Do not explain anything. Just JSON.`;

      const result = await fetchAISuggestion(prompt);
      const cleaned = result.replace(/```json\n?|\n?```/g, '').trim();
      const parsed = JSON.parse(cleaned);

      // Find rightmost node to offset
      const rightmostX = nodes.length > 0 ? Math.max(...nodes.map(n => n.position.x)) : 0;
      const xOffset = nodes.length > 0 ? rightmostX + 400 : 0;

      // Add nodes
      parsed.nodes.forEach((n: any, index: number) => {
        addNode({
          id: n.id,
          type: 'custom',
          position: { x: xOffset + 400, y: (index * 150) + 100 },
          data: { 
            label: n.name, 
            type: n.type.charAt(0).toUpperCase() + n.type.slice(1), 
            description: n.description,
            expanded: true 
          }
        });
      });

      // Add edges
      setTimeout(() => {
        parsed.edges.forEach((e: any) => {
          onConnect({ 
            source: e.source, 
            target: e.target,
            sourceHandle: null,
            targetHandle: null
          });
        });
        fitView({ duration: 800 });
      }, 500);

      toast.success(`Workflow generated! ${parsed.nodes.length} nodes added.`);
      setAIBuilderOpen(false);
    } catch (error) {
      console.error(error);
      toast.error('Something went wrong during generation. Check console or try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const isReadyToGenerate = messages.some(m => m.role === 'ai' && m.content.toLowerCase().includes('ready to generate'));

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-gray-900/50 backdrop-blur-sm p-4">
      <div 
        className="bg-white rounded-2xl shadow-2xl w-[600px] max-h-[80vh] flex flex-col overflow-hidden border border-gray-200"
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
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4 bg-gray-50/30">
          {messages.map((m, i) => (
            <div 
              key={i} 
              className={clsx(
                "flex gap-3 max-w-[85%]",
                m.role === 'user' ? "self-end flex-row-reverse" : "self-start"
              )}
            >
              <div className={clsx(
                "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                m.role === 'ai' ? "bg-white text-[var(--accent)]" : "bg-[var(--accent)] text-white"
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
          ))}
          
          {isThinking && (
            <div className="self-start flex gap-3">
              <div className="w-8 h-8 rounded-full bg-white text-[var(--accent)] flex items-center justify-center shadow-sm border border-gray-100">
                <Bot size={16} />
              </div>
              <div className="bg-white border border-gray-100 p-3 rounded-2xl rounded-tl-none shadow-sm">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                  <span className="w-1.5 h-1.5 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                </div>
              </div>
            </div>
          )}

          {isReadyToGenerate && !isGenerating && (
            <div className="self-center mt-4">
              <button 
                onClick={handleGenerate}
                style={{ backgroundColor: 'var(--accent)' }}
                className="px-6 py-2.5 rounded-full text-white font-bold text-sm shadow-lg hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles size={16} /> Generate Workflow
              </button>
            </div>
          )}

          {isGenerating && (
            <div className="self-center mt-4 flex flex-col items-center gap-2">
              <Loader2 size={24} className="animate-spin text-[var(--accent)]" />
              <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Generating your workflow...</span>
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
              onClick={handleSend}
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
  );
};
