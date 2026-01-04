/**
 * UI Components Index
 * Re-exports all atomic UI components for easy importing.
 */

// Note: Astro components are imported directly via their .astro paths.
// This file serves as documentation of available components.

export const UI_COMPONENTS = {
    MCQQuestion: '../components/ui/MCQQuestion.astro',
    TFQuestion: '../components/ui/TFQuestion.astro',
    Flashcard: '../components/ui/Flashcard.astro',
    TermCard: '../components/ui/TermCard.astro',
} as const;
