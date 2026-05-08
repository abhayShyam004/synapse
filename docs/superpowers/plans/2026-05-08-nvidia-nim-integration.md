# NVIDIA NIM Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a client for NVIDIA NIM API to fetch AI suggestions using the Llama 3.1 8B model.

**Architecture:** A stateless utility function `fetchAISuggestion` that uses the native `fetch` API to communicate with NVIDIA NIM's OpenAI-compatible endpoint.

**Tech Stack:** TypeScript, Vite (for env vars), Vitest (for testing).

---

### Task 1: Project Structure & Env Setup

**Files:**
- Create: `src/lib/ai/nvidiaNim.ts`
- Create: `src/lib/ai/nvidiaNim.test.ts`

- [ ] **Step 1: Create directories**
Run: `mkdir -p src/lib/ai`

- [ ] **Step 2: Create mock test to verify Vitest setup**
Create `src/lib/ai/nvidiaNim.test.ts` with a simple test.
```typescript
import { describe, it, expect } from 'vitest';

describe('Vitest Setup', () => {
  it('should pass', () => {
    expect(true).toBe(true);
  });
});
```

- [ ] **Step 3: Run test**
Run: `npm test src/lib/ai/nvidiaNim.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/lib/ai
git commit -m "chore: setup ai lib directory and test structure"
```

### Task 2: Implement NVIDIA NIM Client

**Files:**
- Modify: `src/lib/ai/nvidiaNim.ts`
- Modify: `src/lib/ai/nvidiaNim.test.ts`

- [ ] **Step 1: Implement the client**
Write the code to `src/lib/ai/nvidiaNim.ts`.

```typescript
// src/lib/ai/nvidiaNim.ts
const API_KEY = import.meta.env.VITE_NVIDIA_NIM_API_KEY;
const BASE_URL = 'https://integrate.api.nvidia.com/v1';

export const fetchAISuggestion = async (prompt: string) => {
  if (!API_KEY) {
    console.warn('VITE_NVIDIA_NIM_API_KEY is not defined');
  }

  const response = await fetch(`${BASE_URL}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: 'meta/llama-3.1-8b-instruct',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `AI API Error: ${response.status}`);
  }
  
  const data = await response.json();
  return data.choices[0].message.content;
};
```

- [ ] **Step 2: Add unit test for the client (mocked)**
Update `src/lib/ai/nvidiaNim.test.ts` to test the function with mocked `fetch`.

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { fetchAISuggestion } from './nvidiaNim';

// Mock import.meta.env
vi.stubGlobal('import', {
  meta: {
    env: {
      VITE_NVIDIA_NIM_API_KEY: 'test-key'
    }
  }
});

describe('fetchAISuggestion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  it('should fetch AI suggestion successfully', async () => {
    const mockResponse = {
      choices: [
        {
          message: {
            content: 'Test suggestion'
          }
        }
      ]
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    });

    const result = await fetchAISuggestion('Hello');
    expect(result).toBe('Test suggestion');
    expect(fetch).toHaveBeenCalledWith(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key'
        })
      })
    );
  });

  it('should throw error on API failure', async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    });

    await expect(fetchAISuggestion('Hello')).rejects.toThrow('Internal Server Error');
  });
});
```

- [ ] **Step 3: Run tests**
Run: `npm test src/lib/ai/nvidiaNim.test.ts`
Expected: PASS

- [ ] **Step 4: Commit**
```bash
git add src/lib/ai/nvidiaNim.ts src/lib/ai/nvidiaNim.test.ts
git commit -m "feat: implement nvidia nim api client with tests"
```
