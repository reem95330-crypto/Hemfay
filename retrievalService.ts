import sources from '../../assets/sources.json';

export interface SourceChunk {
  sourceId: string;
  fileName: string;
  pageNumber: number;
  section: string;
  content: string;
  score?: number;
}

const STOP_WORDS = new Set([
  'the', 'a', 'an', 'and', 'or', 'but', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
  'to', 'of', 'in', 'on', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into',
  'through', 'during', 'before', 'after', 'above', 'below', 'from', 'up', 'down', 'in', 'out',
  'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where',
  'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such',
  'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can',
  'will', 'just', 'don', 'should', 'now', 'i', 'my', 'me', 'we', 'our', 'you', 'your', 'he',
  'him', 'his', 'she', 'her', 'it', 'its', 'they', 'them', 'their'
]);

export const retrievalService = {
  /**
   * Search approved sources for chunks matching the query
   */
  search(query: string, limit = 5): SourceChunk[] {
    if (!query || typeof query !== 'string') return [];

    // Extract keywords
    const keywords = query
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .map(w => w.trim())
      .filter(w => w.length > 2 && !STOP_WORDS.has(w));

    if (keywords.length === 0) {
      // Fallback: if no keywords found (e.g. "What is it?"), try all words longer than 1 char
      const fallbackWords = query
        .toLowerCase()
        .replace(/[^\w\s]/g, ' ')
        .split(/\s+/)
        .map(w => w.trim())
        .filter(w => w.length > 1);
      
      keywords.push(...fallbackWords);
    }

    const scoredChunks: SourceChunk[] = (sources as SourceChunk[]).map(chunk => {
      let score = 0;
      const contentLower = chunk.content.toLowerCase();
      const sectionLower = chunk.section.toLowerCase();
      const fileLower = chunk.fileName.toLowerCase();

      keywords.forEach(keyword => {
        // Count keyword matches in content
        const contentCount = (contentLower.match(new RegExp(escapeRegExp(keyword), 'g')) || []).length;
        score += contentCount;

        // Weight matches in section headers
        if (sectionLower.includes(keyword)) {
          score += 15;
        }

        // Weight matches in file name / document title
        if (fileLower.includes(keyword)) {
          score += 5;
        }
      });

      return {
        ...chunk,
        score
      };
    });

    // Filter out chunks with no match and sort by score descending
    return scoredChunks
      .filter(chunk => (chunk.score || 0) > 0)
      .sort((a, b) => (b.score || 0) - (a.score || 0))
      .slice(0, limit);
  }
};

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
