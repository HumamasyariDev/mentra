/**
 * Checks whether a task is knowledge-based and suitable for a quiz.
 * Returns true (quizzable) or false.
 */
export async function checkQuizzability(taskTitle) {
    try {
        const prompt = `Is the task "${taskTitle}" a knowledge-based or study task suitable for a quiz (e.g., learning, reading, studying a subject)? Answer ONLY with "YES" or "NO". No other words.`;
        const response = await window.puter.ai.chat(prompt);
        const text = extractText(response).trim().toUpperCase();
        return text.startsWith('YES');
    } catch (err) {
        console.error('[checkQuizzability] Error:', err);
        return false;
    }
}

/**
 * Generates an array of quiz questions (default: 5) based on a task title.
 * Returns a parsed array of quiz objects or null on failure.
 *
 * Each quiz shape:
 * {
 *   question: string,
 *   options: string[],      // exactly 4
 *   correct_index: number,  // 0-3
 *   explanation: string,
 * }
 */
export async function generateQuiz(taskTitle, count = 5) {
    const prompt = `Generate ${count} different multiple-choice quiz questions about the topic: "${taskTitle}".
Return ONLY raw JSON — no markdown backticks, no explanation, no extra text.
Return a JSON array with exactly ${count} items using this exact structure:
[{"question":"...","options":["...","...","...","..."],"correct_index":0,"explanation":"..."}]
Rules:
- Each "options" must have exactly 4 items
- "correct_index" is the 0-based index of the correct answer
- "explanation" is a short 1-2 sentence explanation
- All ${count} questions must be distinct and cover different aspects of the topic`;

    try {
        const response = await window.puter.ai.chat(prompt);
        const raw = extractText(response).trim();

        // Strip potential markdown fences
        const cleaned = raw
            .replace(/^```(?:json)?/i, '')
            .replace(/```$/i, '')
            .trim();

        const quizArray = JSON.parse(cleaned);

        if (!Array.isArray(quizArray)) throw new Error('Expected array');

        // Validate and filter each item
        const valid = quizArray.filter(
            (q) =>
                typeof q.question === 'string' &&
                Array.isArray(q.options) &&
                q.options.length === 4 &&
                typeof q.correct_index === 'number' &&
                typeof q.explanation === 'string'
        );

        if (valid.length === 0) throw new Error('No valid quiz items');

        return valid;
    } catch (err) {
        console.error('[generateQuiz] Error:', err);
        return null;
    }
}

/** Extracts plain text from various Puter response shapes */
function extractText(response) {
    if (typeof response === 'string') return response;
    return (
        response?.message?.content?.[0]?.text ??
        response?.message?.content ??
        response?.content ??
        ''
    );
}
