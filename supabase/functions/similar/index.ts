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

    const systemPrompt = `You are a Similar Problem Generator for an AI learning platform.

Given one original ${subject} problem, your job is to generate 3 NEW problems that follow the same type, same level of difficulty, and same concept.

REQUIREMENTS:
• Return ONLY valid JSON. No text outside JSON.
• Each problem must include:
   - "problem": (string, LaTeX allowed)
   - "solution": (string — correct final numeric or symbolic answer)
   - "steps": (string — short explanation of how to solve)
   - "subject": "${subject}"
• Problems must be solvable and not too trivial.
• Do NOT simply copy or slightly modify numbers — change the structure but stay on the same concept.
• Make sure "solution" is the real correct answer.
• Detect language automatically: if the input is Russian, generate in Russian; if English, generate in English.

OUTPUT FORMAT (strict):
{
  "problems": [
    {
      "problem": "Problem statement here",
      "solution": "Final answer here",
      "steps": "Brief explanation of solution steps",
      "subject": "${subject}"
    }
  ]
}

Generate exactly 3 problems. Ensure the output is valid JSON. Do not include markdown code blocks or any text outside the JSON object.`;

    console.log('Calling Lovable AI for similar problems:', { subject, problem_text: problem_text.substring(0, 100) });

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
          { role: 'user', content: `Original problem: ${problem_text}\n\nPlease generate 3 similar practice problems with solutions and brief step explanations in the same language as the original problem.` }
        ],
        temperature: 0.8,
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
      
      // Fallback: return empty problems array
      parsedResponse = {
        problems: []
      };
    }

    return new Response(
      JSON.stringify(parsedResponse),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in similar function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
