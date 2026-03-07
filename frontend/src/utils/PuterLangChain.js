/**
 * PuterLangChain.js
 *
 * A LangChain.js-compatible chat model wrapper for Puter.js.
 *
 * Extends `SimpleChatModel` from @langchain/core which requires only
 * a `_call()` method that returns a string. This is the cleanest way
 * to wrap Puter.js for use in a LangChain-compatible agent loop.
 *
 * Compatible with: @langchain/core@1.x
 *
 * Usage:
 *   const model = new PuterChatModel({ modelName: 'claude-sonnet-4-5' });
 *   const response = await model.call("Hello!");
 */

import { SimpleChatModel } from '@langchain/core/language_models/chat_models';

/**
 * Convert LangChain BaseMessage array to Puter.js format.
 * Puter accepts: string OR [{ role, content }]
 *
 * @param {import('@langchain/core/messages').BaseMessage[]} messages
 * @returns {{ role: string, content: string }[]}
 */
function lcMessagesToPuterFormat(messages) {
    return messages.map((msg) => {
        const type = msg._getType();
        const role =
            type === 'system' ? 'system' :
                type === 'ai' ? 'assistant' :
                    'user';

        return {
            role,
            content: typeof msg.content === 'string' ? msg.content : JSON.stringify(msg.content),
        };
    });
}

/**
 * PuterChatModel — wraps window.puter.ai.chat() as a LangChain SimpleChatModel.
 *
 * Options:
 *   modelName  {string}  Puter.js model (default: 'claude-sonnet-4-5')
 *   temperature {number} Temperature hint
 */
export class PuterChatModel extends SimpleChatModel {
    constructor(fields = {}) {
        super(fields);
        this.modelName = fields.modelName ?? 'claude-sonnet-4-5';
        this.temperature = fields.temperature ?? 0.7;
    }

    _llmType() {
        return 'puter';
    }

    /**
     * Core method required by SimpleChatModel.
     * Returns the LLM's response as a plain string.
     *
     * @param {import('@langchain/core/messages').BaseMessage[]} messages
     * @returns {Promise<string>}
     */
    async _call(messages) {
        if (!window.puter?.ai?.chat) {
            throw new Error(
                'PuterChatModel: window.puter.ai.chat is not available. ' +
                'Make sure Puter.js is loaded before using this model.'
            );
        }

        const puterMessages = lcMessagesToPuterFormat(messages);

        try {
            const response = await window.puter.ai.chat(puterMessages, {
                model: this.modelName,
            });

            // Extract text — Puter returns string, or OpenAI-style object
            if (typeof response === 'string') {
                return response;
            }

            if (response?.message?.content) {
                const content = response.message.content;
                return Array.isArray(content)
                    ? content.map((c) => c.text ?? '').join('')
                    : String(content);
            }

            if (response?.text) {
                return response.text;
            }

            return String(response);
        } catch (error) {
            throw new Error(`PuterChatModel: API call failed — ${error.message}`);
        }
    }
}

export default PuterChatModel;
