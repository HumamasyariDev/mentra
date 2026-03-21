import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';

// Configure PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.mjs',
    import.meta.url
).toString();

/* ─── File Parsing ──────────────────────────────────────────── */

/**
 * Reads a File object and extracts its text content.
 * Supports: .txt, .md, .pdf, .docx, .pptx
 */
export async function extractTextFromFile(file) {
    const ext = file.name.split('.').pop()?.toLowerCase();

    switch (ext) {
        case 'pdf':
            return extractTextFromPDF(file);
        case 'docx':
            return extractTextFromDOCX(file);
        case 'pptx':
            return extractTextFromPPTX(file);
        case 'txt':
        case 'md':
        case 'text':
            return readPlainText(file);
        default:
            throw new Error(`Unsupported file type: .${ext}. Use .txt, .md, .pdf, .docx, or .pptx`);
    }
}

function readPlainText(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsText(file);
    });
}

function readAsArrayBuffer(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => resolve(e.target.result);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsArrayBuffer(file);
    });
}

async function extractTextFromPDF(file) {
    const buffer = await readAsArrayBuffer(file);
    const pdf = await pdfjsLib.getDocument({ data: buffer }).promise;
    const pages = [];
    for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const text = content.items.map((item) => item.str).join(' ');
        if (text.trim()) pages.push(text);
    }
    if (pages.length === 0) throw new Error('Could not extract text from PDF. It may be image-based.');
    return pages.join('\n\n');
}

async function extractTextFromDOCX(file) {
    const buffer = await readAsArrayBuffer(file);
    const result = await mammoth.extractRawText({ arrayBuffer: buffer });
    if (!result.value?.trim()) throw new Error('Could not extract text from DOCX.');
    return result.value;
}

async function extractTextFromPPTX(file) {
    const buffer = await readAsArrayBuffer(file);
    const zip = await JSZip.loadAsync(buffer);
    const texts = [];

    // PPTX slides are stored as ppt/slides/slide*.xml
    const slideFiles = Object.keys(zip.files)
        .filter((name) => /^ppt\/slides\/slide\d+\.xml$/i.test(name))
        .sort();

    for (const slidePath of slideFiles) {
        const xml = await zip.files[slidePath].async('text');
        // Extract text between <a:t> tags
        const matches = xml.match(/<a:t[^>]*>([^<]*)<\/a:t>/g);
        if (matches) {
            const slideText = matches
                .map((m) => m.replace(/<[^>]+>/g, ''))
                .join(' ');
            if (slideText.trim()) texts.push(slideText);
        }
    }

    if (texts.length === 0) throw new Error('Could not extract text from PPTX.');
    return texts.join('\n\n');
}

/* ─── Key Point Extraction ──────────────────────────────────── */

/**
 * Uses Puter.js to extract and summarize key points from raw material.
 * Returns a condensed version that is better suited for quiz generation.
 */
export async function extractKeyPoints(rawText) {
    if (!window.puter?.ai?.chat) {
        throw new Error('Puter.js is not available. Please make sure you are logged in.');
    }

    // Truncate very long texts to avoid token limits (keep ~12k chars)
    const truncated = rawText.length > 12000
        ? rawText.slice(0, 12000) + '\n\n[...truncated for length]'
        : rawText;

    const response = await window.puter.ai.chat([
        {
            role: 'system',
            content: 'You are an expert study assistant. Extract and organize the key concepts, facts, definitions, and important details from the provided material. Output a clear, structured summary with bullet points. This summary will be used to generate quiz questions, so be thorough and precise.'
        },
        {
            role: 'user',
            content: `Extract the key points and important concepts from the following study material:\n\n${truncated}`
        },
    ], { model: 'claude-sonnet-4-5' });

    const summary = extractText(response).trim();
    if (!summary) throw new Error('Failed to extract key points from material.');
    return summary;
}

/* ─── Quiz Generation ───────────────────────────────────────── */

/**
 * Generates quiz questions from study material via Puter.js.
 * Returns a parsed array of quiz objects.
 *
 * Each quiz shape:
 * {
 *   question: string,
 *   options: string[],      // exactly 4
 *   correct_index: number,  // 0-3
 *   explanation: string,
 * }
 */
export async function generateQuizFromMaterial(material, count = 5) {
    if (!window.puter?.ai?.chat) {
        throw new Error('Puter.js is not available. Please make sure you are logged in.');
    }

    const prompt = `Based on the following study material, generate ${count} different multiple-choice quiz questions.
Return ONLY raw JSON — no markdown backticks, no explanation, no extra text.
Return a JSON array with exactly ${count} items using this exact structure:
[{"question":"...","options":["...","...","...","..."],"correct_index":0,"explanation":"..."}]
Rules:
- Each "options" must have exactly 4 items
- "correct_index" is the 0-based index of the correct answer
- "explanation" is a short 1-2 sentence explanation
- All ${count} questions must be distinct and cover different aspects of the material
- Questions should test understanding, not just memorization

STUDY MATERIAL:
${material}`;

    const raw = await window.puter.ai.chat([
        { role: 'system', content: 'You are a quiz generator. Output ONLY raw JSON, no other text.' },
        { role: 'user', content: prompt },
    ], { model: 'claude-sonnet-4-5' });

    const text = extractText(raw).trim();

    // Strip potential markdown fences
    const cleaned = text
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
