import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
import { sequelize, User } from '../models/User.js';
import Document from '../models/Document.js';
import documentRoutes from '../routes/documents.js';
import { analyzeAuditFlags } from '../services/nlpProcessor.js';

const app = express();
app.use(express.json());
app.use('/api/documents', documentRoutes);

let token;
let userId;
let documentId;

beforeAll(async () => {
	await sequelize.sync({ force: true });

	const user = await User.create({
		username: 'traceuser',
		email: 'traceuser@example.com',
		password: 'Trace@123'
	});

	userId = user.id;
	token = jwt.sign(
		{ id: user.id, role: user.role },
		process.env.JWT_SECRET || 'your-secret-key',
		{ expiresIn: '7d' }
	);

	const summaryEvaluation = {
		candidate_summary: 'Turnover increased while debt burden remains elevated.',
		candidate_sentences: [
			'Turnover increased to 500,000 this year.',
			'Loans and borrowings remain significant at 400,000.'
		],
		candidate_tokens: ['turnover', 'increased', 'debt', 'burden'],
		source_sentence_count: 6,
		source_tokens: ['turnover', 'increased', '500000', 'loans', 'borrowings', '400000'],
		selected_sentence_ids: [0, 3],
		metrics_ready: {
			rouge: ['rouge-1', 'rouge-2', 'rouge-l'],
			bleu: ['bleu-1', 'bleu-2', 'bleu-3', 'bleu-4']
		},
		reference_template: {
			human_reference_summary: ''
		}
	};

	const sentenceDecisions = [
		{
			id: 0,
			text: 'Turnover increased to 500,000 this year.',
			selected: true,
			final_score: 1.231,
			scoring_features: {
				figure_hits: 1,
				entity_hits: 1,
				contains_number: true
			}
		},
		{
			id: 1,
			text: 'Administrative expenses remained stable.',
			selected: false,
			final_score: 0.344,
			scoring_features: {
				figure_hits: 0,
				entity_hits: 0,
				contains_number: false
			}
		},
		{
			id: 3,
			text: 'Loans and borrowings remain significant at 400,000.',
			selected: true,
			final_score: 1.118,
			scoring_features: {
				figure_hits: 1,
				entity_hits: 1,
				contains_number: true
			}
		}
	];

	const decisionTrace = {
		summary: {
			method: 'textrank_extractive_v2',
			rule: 'Sentence graph ranking + financial/entity weighting + numeric coverage safeguard',
			selected_sentence_ids: [0, 3],
			sentence_decisions: sentenceDecisions
		},
		entity_and_rule_provenance: {
			entities_used_count: 2,
			financial_figures_used_count: 2,
			entity_examples: [
				{ text: 'Turnover', label: 'MONEY', start_char: 0, end_char: 8 },
				{ text: 'Loans', label: 'ORG', start_char: 40, end_char: 45 }
			],
			financial_figure_examples: [
				{ text: '500,000', start_char: 22, end_char: 29 },
				{ text: '400,000', start_char: 79, end_char: 86 }
			],
			figure_extraction_rule: 'Regex amount match + nearby financial keyword context + de-duplication'
		},
		topics: {
			method: 'LDA',
			rule: 'Top weighted tokens per topic component',
			topic_decisions: [
				{ topic: 1, rule: 'Top-5 terms from LDA component weights', keywords: ['turnover', 'borrowings'] }
			]
		}
	};

	const document = await Document.create({
		originalName: 'trace-test.pdf',
		filename: 'trace-test.pdf',
		filePath: 'uploads/documents/trace-test.pdf',
		fileSize: 12345,
		userId,
		nlpProcessed: true,
		extractedText: 'Financial report text',
		nlpSummary: summaryEvaluation.candidate_summary,
		nlpSummaryEvaluation: summaryEvaluation,
		nlpDecisionTrace: decisionTrace,
		auditFlags: analyzeAuditFlags([
			'Turnover 500000',
			'Loans and borrowings 400000',
			'Profit before tax 25000',
			'Net assets 120000',
			'Gross margin (%) 52.0% 58.0%',
			'The financial statements are prepared on a going concern basis and are dependent upon continuing support.'
		].join('\n'))
	});

	documentId = document.id;
});

afterAll(async () => {
	await sequelize.close();
});

describe('Summary Evaluation Contract', () => {
	test('returns ROUGE/BLEU-ready summary payload from /:id/nlp', async () => {
		const response = await request(app)
			.get(`/api/documents/${documentId}/nlp`)
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		expect(response.body.summary_evaluation).toBeDefined();

		const evaluation = response.body.summary_evaluation;
		expect(typeof evaluation.candidate_summary).toBe('string');
		expect(Array.isArray(evaluation.candidate_sentences)).toBe(true);
		expect(Array.isArray(evaluation.candidate_tokens)).toBe(true);
		expect(typeof evaluation.source_sentence_count).toBe('number');
		expect(Array.isArray(evaluation.source_tokens)).toBe(true);
		expect(Array.isArray(evaluation.selected_sentence_ids)).toBe(true);

		expect(evaluation.metrics_ready).toBeDefined();
		expect(evaluation.metrics_ready.rouge).toEqual(['rouge-1', 'rouge-2', 'rouge-l']);
		expect(evaluation.metrics_ready.bleu).toEqual(['bleu-1', 'bleu-2', 'bleu-3', 'bleu-4']);
		expect(evaluation.reference_template).toEqual({ human_reference_summary: '' });
	});
});

describe('Decision Trace Completeness', () => {
	test('ensures selected summary sentence IDs are fully traceable to sentence decisions', async () => {
		const response = await request(app)
			.get(`/api/documents/${documentId}/nlp`)
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		const trace = response.body.decision_trace;

		expect(trace).toBeDefined();
		expect(typeof trace.summary.rule).toBe('string');
		expect(typeof trace.entity_and_rule_provenance.figure_extraction_rule).toBe('string');
		expect(typeof trace.topics.rule).toBe('string');

		const selectedIds = trace.summary.selected_sentence_ids;
		const decisions = trace.summary.sentence_decisions;

		expect(Array.isArray(selectedIds)).toBe(true);
		expect(Array.isArray(decisions)).toBe(true);
		expect(decisions.length).toBeGreaterThan(0);

		for (const selectedId of selectedIds) {
			const decision = decisions.find(item => item.id === selectedId);
			expect(decision).toBeDefined();
			expect(decision.selected).toBe(true);
			expect(decision.scoring_features).toBeDefined();
		}
	});

	test('ensures audit flags include evidence so anomaly decisions are explainable', async () => {
		const response = await request(app)
			.get(`/api/documents/${documentId}/nlp`)
			.set('Authorization', `Bearer ${token}`);

		expect(response.status).toBe(200);
		const flags = response.body.auditFlags;
		expect(Array.isArray(flags)).toBe(true);
		expect(flags.length).toBeGreaterThan(0);

		for (const flag of flags) {
			expect(flag.id).toBeDefined();
			expect(flag.severity).toBeDefined();
			expect(flag.title).toBeDefined();
			expect(flag.message).toBeDefined();
			expect(flag.evidence).toBeDefined();
			expect(typeof flag.evidence).toBe('object');
			expect(Object.keys(flag.evidence).length).toBeGreaterThan(0);
		}
	});
});
