import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';
import JSZip from 'jszip';
import { aiApi } from '../services/api';

// Configure PDF.js worker via CDN to avoid Vite build asset issues in production
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;

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
 * Uses backend AI API to extract and summarize key points from raw material.
 * Returns a condensed version that is better suited for quiz generation.
 */
export async function extractKeyPoints(rawText) {
    // Truncate very long texts to avoid token limits (keep ~12k chars)
    const truncated = rawText.length > 12000
        ? rawText.slice(0, 12000) + '\n\n[...truncated for length]'
        : rawText;

    const response = await aiApi.extractKeyPoints(truncated);
    
    if (!response.data?.success) {
        throw new Error('Failed to extract key points from material.');
    }
    
    return response.data.key_points;
}

/* ─── Quiz Generation ───────────────────────────────────────── */

/**
 * Generates quiz questions from study material via backend AI API.
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
    const response = await aiApi.generateQuiz(material, count);
    
    if (!response.data?.success || !response.data?.questions) {
        throw new Error(response.data?.error || 'Failed to generate quiz');
    }

    const quizArray = response.data.questions;

    if (!Array.isArray(quizArray)) throw new Error('Expected array');

    // Validate and normalize each item
    const valid = quizArray.map((q) => ({
        question: q.question,
        options: q.options,
        correct_index: q.correct ?? q.correct_index ?? 0,
        explanation: q.explanation || '',
    })).filter(
        (q) =>
            typeof q.question === 'string' &&
            Array.isArray(q.options) &&
            q.options.length === 4 &&
            typeof q.correct_index === 'number'
    );

    if (valid.length === 0) throw new Error('No valid quiz items');

    return valid;
}
