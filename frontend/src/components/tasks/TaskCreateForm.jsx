import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, FileText, Upload, X, Zap } from 'lucide-react';
import { generateQuizFromMaterial, extractTextFromFile, extractKeyPoints } from '../../utils/quizHelpers';
import { quizApi } from '../../services/api';
import '../../styles/components/tasks/TaskComponents.css';

export default function TaskCreateForm({ onSubmit, isPending }) {
  const { t } = useTranslation(['tasks', 'common']);
  const [taskType, setTaskType] = useState('normal'); // 'normal' | 'quiz'
  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: '',
  });
  const [material, setMaterial] = useState('');
  const [file, setFile] = useState(null);
  const [questionCount, setQuestionCount] = useState(5);
  const [generating, setGenerating] = useState(false);
  const [generatingStatus, setGeneratingStatus] = useState('');
  const [fileLoading, setFileLoading] = useState(false);
  const [error, setError] = useState('');

  const resetForm = () => {
    setForm({ title: '', description: '', priority: 'medium', due_date: '' });
    setMaterial('');
    setFile(null);
    setQuestionCount(5);
    setError('');
    setGenerating(false);
  };

  const handleFileChange = async (e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    setFile(selectedFile);
    setError('');
    setFileLoading(true);
    try {
      const text = await extractTextFromFile(selectedFile);
      setMaterial(text);
    } catch (err) {
      console.error('[TaskCreateForm] File parse error:', err);
      setError(err.message || t('tasks:createForm.errorFileParse'));
      setFile(null);
    } finally {
      setFileLoading(false);
    }
  };

  const removeFile = () => {
    setFile(null);
    setMaterial('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (taskType === 'quiz') {
      if (!material.trim()) {
        setError(t('tasks:createForm.errorNoMaterial'));
        return;
      }

      setGenerating(true);
      try {
        // 1. Extract key points from material via NVIDIA API
        setGeneratingStatus(t('tasks:createForm.extractingKeyPoints'));
        const keyPoints = await extractKeyPoints(material.trim());

        // 2. Generate quiz from key points via NVIDIA API
        setGeneratingStatus(t('tasks:createForm.generatingQuestions'));
        const questions = await generateQuizFromMaterial(keyPoints, questionCount);

        // 3. Create the task (with type: 'quiz'), then save quiz in afterCreate callback
        setGeneratingStatus(t('tasks:createForm.savingTask'));
        const taskPayload = { ...form, type: 'quiz' };
        onSubmit(taskPayload, resetForm, async (createdTask) => {
          await quizApi.save(createdTask.id, questions, material.trim());
        });
      } catch (err) {
        console.error('[TaskCreateForm] Quiz generation error:', err);
        setError(err.message || t('tasks:createForm.errorQuizGeneration'));
        setGenerating(false);
        setGeneratingStatus('');
      }
    } else {
      // Normal task — simple create
      onSubmit({ ...form, type: 'normal' }, resetForm);
    }
  };

  const isSubmitting = isPending || generating;

  return (
    <form onSubmit={handleSubmit} className="task-create-form">
      {/* Type Tabs */}
      <div className="task-type-tabs">
        <button
          type="button"
          className={`task-type-tab ${taskType === 'normal' ? 'active' : ''}`}
          onClick={() => setTaskType('normal')}
        >
          <FileText style={{ width: '1rem', height: '1rem' }} />
          {t('tasks:createForm.normalTask')}
        </button>
        <button
          type="button"
          className={`task-type-tab ${taskType === 'quiz' ? 'active' : ''}`}
          onClick={() => setTaskType('quiz')}
        >
          <Zap style={{ width: '1rem', height: '1rem' }} />
          {t('tasks:createForm.quizTask')}
        </button>
      </div>

      <div className="task-create-form-grid">
        <div className="task-form-group">
          <label className="task-form-label">{t('tasks:createForm.titleLabel')}</label>
          <input
            type="text"
            className="task-form-input"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            placeholder={t('tasks:createForm.titlePlaceholder')}
            required
          />
        </div>
        <div className="task-form-group">
          <label className="task-form-label">{t('tasks:createForm.descriptionLabel')}</label>
          <textarea
            className="task-form-input task-form-textarea"
            rows={2}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder={t('tasks:createForm.descriptionPlaceholder')}
          />
        </div>
        <div className="task-create-form-row">
          <div className="task-form-group">
            <label className="task-form-label">{t('tasks:createForm.priorityLabel')}</label>
            <select
              className="task-form-select"
              value={form.priority}
              onChange={(e) => setForm({ ...form, priority: e.target.value })}
            >
              <option value="low">{t('common:priority.low')}</option>
              <option value="medium">{t('common:priority.medium')}</option>
              <option value="high">{t('common:priority.high')}</option>
            </select>
          </div>
          <div className="task-form-group">
            <label className="task-form-label">{t('tasks:createForm.dueDateLabel')}</label>
            <input
              type="date"
              className="task-form-input"
              value={form.due_date}
              onChange={(e) => setForm({ ...form, due_date: e.target.value })}
            />
          </div>
        </div>

        {/* Quiz Material Section */}
        {taskType === 'quiz' && (
          <div className="task-form-group">
            <label className="task-form-label">{t('tasks:createForm.studyMaterialLabel')}</label>
            <p className="task-form-hint">{t('tasks:createForm.studyMaterialHint')}</p>
            <div className="task-form-question-count">
              <label className="task-form-label" dangerouslySetInnerHTML={{ __html: t('tasks:createForm.questionCountLabel', { count: questionCount }) }} />
              <input
                type="range"
                min={5}
                max={25}
                step={1}
                value={questionCount}
                onChange={(e) => setQuestionCount(Number(e.target.value))}
                className="task-form-range"
              />
              <div className="task-form-range-labels">
                <span>5</span>
                <span>25</span>
              </div>
            </div>
            <textarea
              className="task-form-input task-form-textarea task-form-material"
              rows={6}
              value={material}
              onChange={(e) => { setMaterial(e.target.value); setFile(null); }}
              placeholder={t('tasks:createForm.materialPlaceholder')}
            />
            <div className="task-form-file-row">
              <label className="task-form-file-btn">
                <Upload style={{ width: '0.875rem', height: '0.875rem' }} />
                {t('tasks:createForm.uploadFile')}
                <input
                  type="file"
                  accept=".txt,.md,.text,.pdf,.docx,.pptx"
                  onChange={handleFileChange}
                  style={{ display: 'none' }}
                />
              </label>
              {fileLoading && (
                <span className="task-form-file-name">
                  <Loader2 style={{ width: '0.75rem', height: '0.75rem', animation: 'task-spin 0.8s linear infinite' }} />
                  {t('tasks:createForm.readingFile')}
                </span>
              )}
              {file && !fileLoading && (
                <span className="task-form-file-name">
                  {file.name}
                  <button type="button" onClick={removeFile} className="task-form-file-remove">
                    <X style={{ width: '0.75rem', height: '0.75rem' }} />
                  </button>
                </span>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Error */}
      {error && <p className="task-form-error">{error}</p>}

      <div className="task-form-actions">
        <button
          type="submit"
          className="task-form-btn task-form-btn-primary task-form-submit-btn"
          disabled={isSubmitting}
        >
          {isSubmitting && <Loader2 className="task-form-spinner" />}
          {generating ? (generatingStatus || t('tasks:createForm.generatingQuiz')) : t('tasks:createForm.createTask')}
        </button>
      </div>
    </form>
  );
}
