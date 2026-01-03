/**
 * Factory Test Scaffold
 * Tests for QuestionFactory
 */
import { describe, it, expect } from 'vitest';
import { QuestionFactory, type RawQuestionData } from '../ai/QuestionFactory';

describe('QuestionFactory', () => {
    describe('create MCQ', () => {
        it('should create a valid MCQ question', () => {
            const data: RawQuestionData = {
                type: 'mcq',
                question: 'What is 2+2?',
                options: ['3', '4', '5', '6'],
                correct: 1,
                explanation: '2+2 equals 4',
                category: 'Math'
            };

            const question = QuestionFactory.create(data);

            expect(question.type).toBe('mcq');
            expect(question.question).toBe('What is 2+2?');
            expect(question.correct).toBe(1);
            expect(question.id).toBeDefined();
        });

        it('should throw if MCQ has less than 2 options', () => {
            const data: RawQuestionData = {
                type: 'mcq',
                question: 'Invalid',
                options: ['Only one'],
                correct: 0,
                explanation: 'Test',
                category: 'Test'
            };

            expect(() => QuestionFactory.create(data)).toThrow('at least 2 options');
        });
    });

    describe('create TF', () => {
        it('should create a valid T/F question', () => {
            const data: RawQuestionData = {
                type: 'tf',
                question: 'The sky is blue',
                correct: true,
                explanation: 'The sky appears blue due to Rayleigh scattering',
                category: 'Science'
            };

            const question = QuestionFactory.create(data);

            expect(question.type).toBe('tf');
            expect(question.correct).toBe(true);
        });

        it('should throw if T/F correct is not boolean', () => {
            const data: RawQuestionData = {
                type: 'tf',
                question: 'Invalid',
                correct: 1 as any, // Wrong type
                explanation: 'Test',
                category: 'Test'
            };

            expect(() => QuestionFactory.create(data)).toThrow('must be a boolean');
        });
    });

    describe('createBatch', () => {
        it('should create multiple questions', () => {
            const dataArray: RawQuestionData[] = [
                {
                    type: 'mcq',
                    question: 'Q1',
                    options: ['A', 'B'],
                    correct: 0,
                    explanation: 'E1',
                    category: 'C1'
                },
                {
                    type: 'tf',
                    question: 'Q2',
                    correct: false,
                    explanation: 'E2',
                    category: 'C2'
                }
            ];

            const questions = QuestionFactory.createBatch(dataArray);

            expect(questions.length).toBe(2);
            expect(questions[0].type).toBe('mcq');
            expect(questions[1].type).toBe('tf');
        });
    });
});
