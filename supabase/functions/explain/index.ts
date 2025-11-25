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

    const systemPrompt = `You are ClassMate AI, a friendly and precise educational tutor specializing in ${subject}.
Your duties:
1) Restate the student's problem in simpler and clearer words.
2) Solve the problem step-by-step with numbered steps.
3) Give the final answer separately.
4) Never reveal chain-of-thought — only provide short logical explanations.
5) Output must be clean, structured, and formatted.
6) Follow the subject context strictly.
7) Detect language automatically: if the input is Russian, respond in Russian; if English, respond in English. Never mix languages.
8) Keep explanations concise but educational.

You MUST respond with a valid JSON object in this exact format:
{
  "simplified_problem": "A single concise paragraph restating the problem clearly",
  "steps": ["Step 1: explanation", "Step 2: explanation", "Step 3: explanation"],
  "final_answer": "Plain text final answer without additional wording"
}

Ensure the output is valid JSON. Do not include markdown code blocks or any text outside the JSON object.`;

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
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      console.error('AI response:', aiMessage);
      
      // Fallback: create structured response from text
      parsedResponse = {
        simplified_problem: problem_text,
        steps: aiMessage.split('\n').filter((line: string) => line.trim()).map((line: string, idx: number) => `${idx + 1}. ${line}`),
        final_answer: "See steps above for the complete solution."
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
