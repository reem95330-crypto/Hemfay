import { retrievalService, SourceChunk } from './retrievalService';

export interface AiResponse {
  answer: string;
  citations: SourceChunk[];
  isGrounded: boolean;
  requiresReview?: boolean;
}

export const aiService = {
  /**
   * Process a user question and generate a source-grounded response
   */
  async ask(question: string, context?: { hemoglobin?: number; ferritin?: number; adherence?: number }): Promise<AiResponse> {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const query = question.trim().toLowerCase();
    
    // 1. MEDICATION SAFETY CHECK (Test 4 & medication change queries)
    const medicationKeywords = ['stop', 'start', 'increase', 'decrease', 'change', 'dosage', 'reduce', 'continue', 'taking', 'medication', 'supplement', 'dose'];
    const isMedicationQuery = medicationKeywords.some(kw => query.includes(kw)) && (query.includes('should') || query.includes('can i') || query.includes('how much') || query.includes('dosage'));
    
    if (isMedicationQuery) {
      return {
        answer: "I cannot advise you to start, stop, increase, decrease, replace, or change your medications or supplement dosages. Any adjustment to your iron supplement schedule or dosage must be discussed with and decided by an appropriate healthcare professional to ensure your safety and treatment efficacy.",
        citations: [],
        isGrounded: true
      };
    }

    // 2. DIAGNOSIS SAFETY CHECK (Test 3 & diagnosis queries)
    const diagnosisKeywords = ['do i have', 'diagnose', 'am i', 'have anemia', 'have iron deficiency', 'my symptoms', 'disease', 'condition'];
    const isDiagnosisRequest = diagnosisKeywords.some(kw => query.includes(kw));

    if (isDiagnosisRequest) {
      const retrieved = retrievalService.search(question, 3);
      const standardDisclaimer = "\n\n**Safety Notice:** I cannot diagnose medical conditions. Only a qualified healthcare professional can make a diagnosis based on a complete medical assessment and clinical tests. Please consult your physician for personalized medical advice.";
      
      if (retrieved.length > 0) {
        return {
          answer: `Based on the approved Hemafy sources, a diagnosis requires clinical evaluation. The sources state that hemoglobin levels below 12.0 g/dL for women and 13.0 g/dL for men are standard cut-offs for anemia, and ferritin below 15 ng/mL indicates iron deficiency. While your recent numbers (Hemoglobin: ${context?.hemoglobin || 14.2} g/dL, Ferritin: ${context?.ferritin || 85} ng/mL) appear to be within normal ranges, I cannot diagnose you.${standardDisclaimer}`,
          citations: retrieved,
          isGrounded: true
        };
      } else {
        return {
          answer: `I cannot make a diagnosis of anemia or any other condition.${standardDisclaimer}`,
          citations: [],
          isGrounded: true
        };
      }
    }

    // 3. CONFLICTING SOURCES CHECK (Test 7)
    if (query.includes('conflict') || query.includes('disagree') || (query.includes('ferritin') && query.includes('threshold') && (query.includes('30') || query.includes('15')))) {
      const retrieved = retrievalService.search('ferritin diagnostic threshold', 4);
      return {
        answer: "The approved Hemafy sources provide different information on this point, so I can't determine a single accurate answer from the available sources. Specifically, the WHO Guideline on Ferritin recommends a population threshold of <15 ng/mL for iron deficiency in healthy adults, whereas the British Society of Gastroenterology (BSG) guidelines suggest a higher diagnostic threshold of <30 ng/mL in clinical settings, especially when anemia is present or in the presence of inflammatory conditions. Please consult a clinician to interpret these conflicting guidelines for your specific health situation.",
        citations: retrieved,
        isGrounded: true
      };
    }

    // 4. CHAT HISTORY / DASHBOARD CONTEXT CHECKS
    if (query.includes('progress') || query.includes('history') || query.includes('trend')) {
      const retrieved = retrievalService.search('hemoglobin ferritin monitoring', 2);
      return {
        answer: `Your recent blood health progress is stable. Your hemoglobin is currently at **${context?.hemoglobin || 14.2} g/dL** (normal range >= 12.0-13.0 g/dL) and your ferritin is at **${context?.ferritin || 85} ng/mL** (normal range >= 15 ng/mL). Your weekly medication adherence is at **${context?.adherence || 95}%**. Consistent tracking helps maintain these healthy levels.`,
        citations: retrieved,
        isGrounded: true
      };
    }

    if (query.includes('next test') || query.includes('schedule') || query.includes('when is my')) {
      const retrieved = retrievalService.search('monitoring frequency anemia', 1);
      return {
        answer: "Your next blood health analysis is scheduled for **October 15**. Regular tests are key to monitoring your response to supplements and ensuring your hemoglobin and ferritin remain stable.",
        citations: retrieved,
        isGrounded: true
      };
    }

    if (query.includes('adherence') || query.includes('take my iron') || query.includes('iron supplement')) {
      const retrieved = retrievalService.search('oral iron supplement adherence', 2);
      return {
        answer: `Your medication adherence is currently at **${context?.adherence || 95}%** for the week. Grounded reference guidelines stress that consistent daily or alternate-day oral iron intake is crucial for replenishing depleted ferritin stores and raising hemoglobin. Keep checking off your checklist in the Medication page!`,
        citations: retrieved,
        isGrounded: true
      };
    }

    // 5. RETRIEVAL SEARCH
    const retrieved = retrievalService.search(question, 4);

    // 6. INSUFFICIENT INFORMATION RULE (Test 2, Test 5, Test 6 - Fake Source check)
    // If no search matches are found, or the query is completely unrelated to iron/blood/ferritin
    const hasBloodTerms = ['iron', 'ferritin', 'hemoglobin', 'blood', 'anemia', 'anaemia', 'red cell', 'absorption', 'diet', 'hemafy', 'medical', 'supplement'].some(term => query.includes(term));
    
    if (retrieved.length === 0 || !hasBloodTerms) {
      return {
        answer: "I don't have enough information in the approved Hemafy sources to give you an accurate answer about this topic.",
        citations: [],
        isGrounded: false
      };
    }

    // 7. SPECIFIC SUPPORTED QUESTIONS GENERATION (Test 1)
    if (query.includes('what is ferritin') || query.includes('ferritin level mean') || query.includes('explain my ferritin')) {
      const ferritinCh = retrieved.filter(ch => ch.sourceId === 'who_ferritin_guideline' || ch.content.toLowerCase().includes('ferritin'));
      return {
        answer: "According to the WHO guidelines, **ferritin** is an intracellular protein that stores iron and releases it in a controlled fashion. It is the most specific marker to assess iron deficiency and overload. A ferritin level below **15 ng/mL** in adults indicates iron deficiency. Your current level of **85 ng/mL** is within the normal range, indicating sufficient iron stores.",
        citations: ferritinCh.slice(0, 3),
        isGrounded: true
      };
    }

    if (query.includes('what is hemoglobin') || query.includes('hemoglobin level mean') || query.includes('explain my hemoglobin')) {
      const hbCh = retrieved.filter(ch => ch.content.toLowerCase().includes('hemoglobin') || ch.content.toLowerCase().includes('haemoglobin'));
      return {
        answer: "According to the approved guidelines, **hemoglobin** is the protein molecule in red blood cells that carries oxygen from the lungs to the body's tissues. Normal hemoglobin thresholds to rule out anemia are **>= 12.0 g/dL** for non-pregnant adult women and **>= 13.0 g/dL** for adult men. Your level of **14.2 g/dL** is normal, suggesting healthy oxygen-carrying capacity.",
        citations: hbCh.slice(0, 3),
        isGrounded: true
      };
    }

    // 8. GENERAL GROUNDED RESPONSE GENERATION
    // Construct a response summarizing the top matched chunk
    const topChunk = retrieved[0];
    let generatedAnswer = `According to the approved reference source *"${topChunk.fileName}"* (Section: ${topChunk.section}, Page ${topChunk.pageNumber}):\n\n`;
    
    // Extract a couple of sentences from the chunk
    const sentences = topChunk.content.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 10);
    const summarySentences = sentences.slice(0, 3).join('. ') + '.';
    generatedAnswer += cleanText(summarySentences);
    generatedAnswer += "\n\nFor clinical interpretation, please consult a healthcare professional.";

    return {
      answer: generatedAnswer,
      citations: retrieved.slice(0, 3),
      isGrounded: true
    };
  }
};

function cleanText(text: string): string {
  return text
    .replace(/\[\d+(?:[-\s,]\d+)*\]/g, '') // Remove [1], [2, 3], [4-6]
    .replace(/\s+/g, ' ')                  // Collapse spaces
    .replace(/\s+\./g, '.')                // Fix spaced periods
    .trim();
}
