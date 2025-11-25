import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { subject, problem_text } = await req.json();
    
    if (!subject || !problem_text) {
      return new Response(
        JSON.stringify({ error: 'Missing subject or problem_text' }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY is not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are ClassMate AI, an educational problem-solving assistant.
Your job is to analyze, explain, and solve academic tasks in math, physics, and programming.
You MUST ALWAYS return strict JSON only, no additional text.

1. LANGUAGE DETECTION
Detect the language of the user's input automatically:
- If >60% Russian → respond entirely in Russian
- If >60% English → respond entirely in English
- Never mix languages
- Use warm, friendly, teacher-like tone

2. INPUT VALIDATION
If the user input is not an academic problem (e.g., greetings, random text, jokes), respond with:
{
  "error": "Please enter a valid educational problem in math, physics, or programming."
}

Valid problems include: equations, integrals, derivatives, word problems, physics calculations, algorithms, coding tasks.

3. MULTI-STEP CHAINING
If the problem contains multiple sub-problems:
- Detect sub-problems
- Solve them one by one
- Include a "substeps" array explaining each mini-step
- Still produce a single final answer

4. OUTPUT FORMAT (STRICT JSON)
ALWAYS return a JSON object:
{
  "simplified": "string - Rewrite the problem in simpler language, same target language",
  "steps": ["step1", "step2", "..."] - Clear, logical, numbered solution steps. One concept per step,
  "final_answer": "string - Only the direct answer (number, expression, explanation)",
  "difficulty": "easy | medium | hard",
  "confidence": "0-100%",
  "key_concept": "string - 1-3 sentences describing the main rule or formula used",
  "common_mistakes": ["mistake1", "mistake2"] - 2-3 typical mistakes students make,
  "substeps": [
    {
      "title": "string",
      "steps": ["substep1", "substep2"],
      "result": "string"
    }
  ] - Only if the problem has multiple parts, otherwise return []
}

Difficulty rules:
- EASY → basic algebra, basic arithmetic
- MEDIUM → quadratic equations, derivatives, integrals, mid-level physics
- HARD → advanced integrals, multi-step reasoning, algorithmic optimization

Rules:
- JSON must be valid
- No markdown code blocks
- No extra comments
- No explanations outside JSON
- If JSON formatting fails, automatically fix and return valid JSON

5. BEHAVIOR RULES
- Never give irrelevant text
- Never lecture unless asked
- Keep answers short but complete
- If unsure → still provide best attempt, with lower confidence

Subject context: ${subject}`;

    // Validate input as academic problem
    const isAcademicProblem = (text: string): boolean => {
      const trimmed = text.trim();
      if (trimmed.length < 1) return false;
      
      const lowerText = trimmed.toLowerCase();
      const academicKeywords = ['solve', 'calculate', 'find', 'prove', 'explain', 'equation', 'integral', 'derivative', 'function', 'algorithm', 'code', 'program', 'physics', 'force', 'velocity', 'решите', 'найдите', 'вычислите', 'докажите', 'уравнение', 'интеграл', 'производная', 'функция', 'алгоритм'];
      const hasNumbers = /\d/.test(text);
      const hasMathSymbols = /[+\-*/=<>∫∑√π()[\]{}^]/.test(text);
      const hasAcademicKeyword = academicKeywords.some(keyword => lowerText.includes(keyword));
      
      // Allow short problems if they have math symbols or numbers (like "1+2")
      // Require longer text only if no clear math/academic indicators
      if (hasMathSymbols || hasNumbers) return true;
      if (hasAcademicKeyword && trimmed.length >= 5) return true;
      
      return trimmed.length > 15;
    };

    if (!isAcademicProblem(problem_text)) {
      return new Response(
        JSON.stringify({ 
          error: problem_text.match(/[а-яА-Я]/) 
            ? 'Пожалуйста, введите корректную учебную задачу по математике, физике или программированию.'
            : 'Please enter a valid educational problem in math, physics, or programming.'
        }), 
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Calling Lovable AI for explanation:', { subject, problem_text: problem_text.substring(0, 100) });

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Problem: ${problem_text}\n\nPlease explain this step-by-step in the same language as the problem.` }
        ],
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment.' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Please add credits to continue.' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      return new Response(
        JSON.stringify({ error: 'Failed to get AI response' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    console.log('AI response received');
    
    const aiMessage = data.choices[0]?.message?.content;
    if (!aiMessage) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ error: 'Empty response from AI' }), 
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response from AI
    let parsedResponse;
    try {
      // Remove markdown code blocks if present
      const cleanedMessage = aiMessage.replace(/```json\n?|\n?```/g, '').trim();
      parsedResponse = JSON.parse(cleanedMessage);
      
      // Check if AI returned an error
      if (parsedResponse.error) {
        return new Response(
          JSON.stringify(parsedResponse), 
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      // Map new field names to old ones for backward compatibility
      if (parsedResponse.simplified && !parsedResponse.simplified_problem) {
        parsedResponse.simplified_problem = parsedResponse.simplified;
      }
      
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response:', aiMessage);
      
      // Fallback: create structured response from text
      parsedResponse = {
        simplified_problem: problem_text,
        steps: aiMessage.split('\n').filter((line: string) => line.trim()).map((line: string, idx: number) => `${idx + 1}. ${line}`),
        final_answer: "See steps above for the complete solution.",
        difficulty: "medium",
        confidence: "50%",
        key_concept: "Unable to parse AI response",
        common_mistakes: [],
        substeps: []
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in explain function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
