async function postJson<T>(url: string, body: unknown): Promise<T> {
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload.error || `Request failed: ${response.status}`);
  }

  return response.json();
}

export const aiService = {
  async generateAnalysis(responsesData: any) {
    return postJson<any>('/api/ai/summary', { responses: responsesData });
  },

  async analyzeSingleResponse(response: any, questions: any[]) {
    return postJson<any>('/api/ai/individual', { response, questions });
  },

  generateSummaryMarkdown(analysis: any, responsesCount: number, customerName: string) {
    return `
# AI Readiness Summary Report: ${customerName}
**Generated:** ${new Date().toLocaleDateString()}
**Volume:** ${responsesCount} Responses

## Executive Summary
${analysis.executiveSummary}

## Identified Themes
${(analysis.themes || []).map((t: any) => `### ${t.name}\n${t.description} (Evidence Count: ${t.evidenceCount ?? 'N/A'})`).join('\n\n')}

## Proposed Use Cases
${(analysis.useCases || []).map((u: any) => `### ${u.title} [Priority: ${u.priority ?? 'N/A'}]\n${u.description}`).join('\n\n')}

## Strategic Recommendations
${(analysis.recommendations || []).map((r: any) => `- ${r}`).join('\n')}

---
*End of Protocol Report*
    `.trim();
  },

  generateIndividualMarkdown(response: any, analysis: any) {
    return `
# Individual Readiness Profile: ${response.respondent_name || 'Anonymous'}
**Ingested:** ${new Date(response.submitted_at).toLocaleString()}
**Email:** ${response.respondent_email || 'N/A'}

## Analysis Summary
${analysis.summary}

## AI Literacy Level: ${analysis.literacyLevel}/5

## Key Opportunities
${(analysis.opportunities || []).map((o: any) => `- ${o}`).join('\n')}

## Barriers & Concerns
${(analysis.concerns || []).map((c: any) => `- ${c}`).join('\n')}

---
*Respondent ID: ${response.id}*
    `.trim();
  }
};
