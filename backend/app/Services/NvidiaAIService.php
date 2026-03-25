<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;

class NvidiaAIService
{
    protected string $apiKey;
    protected string $baseUrl;
    protected string $model;

    public function __construct()
    {
        $this->apiKey = config('services.nvidia.api_key');
        $this->baseUrl = config('services.nvidia.base_url', 'https://integrate.api.nvidia.com/v1');
        $this->model = config('services.nvidia.model', 'meta/llama-3.1-8b-instruct');
    }

    /**
     * Send a chat completion request to NVIDIA API.
     *
     * @param array $messages Array of messages with 'role' and 'content'
     * @param array $options Optional parameters (temperature, max_tokens, etc.)
     * @return array Response containing the assistant's message
     */
    public function chat(array $messages, array $options = []): array
    {
        $payload = [
            'model' => $options['model'] ?? $this->model,
            'messages' => $messages,
            'temperature' => $options['temperature'] ?? 0.7,
            'max_tokens' => $options['max_tokens'] ?? 1024,
            'top_p' => $options['top_p'] ?? 0.9,
            'stream' => false,
        ];

        try {
            $response = Http::withHeaders([
                'Authorization' => 'Bearer ' . $this->apiKey,
                'Content-Type' => 'application/json',
            ])->timeout(60)->post($this->baseUrl . '/chat/completions', $payload);

            if ($response->failed()) {
                Log::error('NVIDIA API Error', [
                    'status' => $response->status(),
                    'body' => $response->body(),
                ]);

                return [
                    'success' => false,
                    'error' => 'API request failed: ' . $response->status(),
                    'message' => null,
                ];
            }

            $data = $response->json();

            return [
                'success' => true,
                'message' => $data['choices'][0]['message']['content'] ?? '',
                'usage' => $data['usage'] ?? null,
            ];
        } catch (\Exception $e) {
            Log::error('NVIDIA AI Service Exception', [
                'message' => $e->getMessage(),
            ]);

            return [
                'success' => false,
                'error' => $e->getMessage(),
                'message' => null,
            ];
        }
    }

    /**
     * Simple chat with a single prompt (adds system prompt automatically).
     *
     * @param string $userMessage The user's message
     * @param string|null $systemPrompt Optional system prompt
     * @return string The assistant's response
     */
    public function ask(string $userMessage, ?string $systemPrompt = null): string
    {
        $messages = [];

        if ($systemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $systemPrompt,
            ];
        }

        $messages[] = [
            'role' => 'user',
            'content' => $userMessage,
        ];

        $result = $this->chat($messages);

        return $result['success'] ? $result['message'] : 'Maaf, terjadi kesalahan saat memproses permintaan Anda.';
    }

    /**
     * Chat with conversation history.
     *
     * @param array $history Previous messages
     * @param string $newMessage New user message
     * @param string|null $systemPrompt System prompt
     * @return array Response with message and updated history
     */
    public function chatWithHistory(array $history, string $newMessage, ?string $systemPrompt = null): array
    {
        $messages = [];

        if ($systemPrompt) {
            $messages[] = [
                'role' => 'system',
                'content' => $systemPrompt,
            ];
        }

        // Add conversation history
        foreach ($history as $msg) {
            $messages[] = [
                'role' => $msg['role'],
                'content' => $msg['content'],
            ];
        }

        // Add new user message
        $messages[] = [
            'role' => 'user',
            'content' => $newMessage,
        ];

        $result = $this->chat($messages);

        if ($result['success']) {
            return [
                'success' => true,
                'message' => $result['message'],
                'history' => [
                    ...$history,
                    ['role' => 'user', 'content' => $newMessage],
                    ['role' => 'assistant', 'content' => $result['message']],
                ],
            ];
        }

        return [
            'success' => false,
            'message' => 'Maaf, terjadi kesalahan saat memproses permintaan Anda.',
            'error' => $result['error'],
            'history' => $history,
        ];
    }
}
