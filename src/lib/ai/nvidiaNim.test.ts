import { describe, it, expect, vi, beforeEach, type MockedFunction } from 'vitest';
import { fetchAISuggestion } from './nvidiaNim';

describe('fetchAISuggestion', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
    vi.stubEnv('VITE_NVIDIA_NIM_API_KEY', 'test-key');
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

    (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
      ok: true,
      json: async () => mockResponse,
    } as unknown as Response);

    const result = await fetchAISuggestion('Hello');
    expect(result).toBe('Test suggestion');
    expect(fetch).toHaveBeenCalledWith(
      'https://integrate.api.nvidia.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'Authorization': 'Bearer test-key',
          'Content-Type': 'application/json'
        }),
        body: JSON.stringify({
          model: 'meta/llama-3.1-8b-instruct',
          messages: [{ role: 'user', content: 'Hello' }],
          temperature: 0.7,
          max_tokens: 150,
        })
      })
    );
  });

  it('should throw error on API failure', async () => {
    (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 500,
      json: async () => ({ message: 'Internal Server Error' }),
    } as unknown as Response);

    await expect(fetchAISuggestion('Hello')).rejects.toThrow('Internal Server Error');
  });

  it('should handle API failure without message', async () => {
    (fetch as MockedFunction<typeof fetch>).mockResolvedValue({
      ok: false,
      status: 404,
      json: async () => { throw new Error('Parse error'); },
    } as unknown as Response);

    await expect(fetchAISuggestion('Hello')).rejects.toThrow('AI API Error: 404');
  });
});
