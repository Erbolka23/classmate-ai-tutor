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
1) Generate exactly 4 similar practice problems based on the original problem.
2) Each problem should test the same concepts and have similar difficulty.
3) Provide short, clear answers for each problem.
4) Never reveal chain-of-thought — only provide educational content.
5) Follow the subject context strictly.
6) Detect language automatically: if the input is Russian, generate problems in Russian; if English, generate in English. Never mix languages.
7) Keep problems concise but educational.

You MUST respond with a valid JSON object in this exact format:
{
  "problems": [
    {"problem": "Problem statement 1", "answer": "Short answer 1"},
    {"problem": "Problem statement 2", "answer": "Short answer 2"},
    {"problem": "Problem statement 3", "answer": "Short answer 3"},
    {"problem": "Problem statement 4", "answer": "Short answer 4"}
  ]
}

Generate exactly 4 problems. Ensure the output is valid JSON. Do not include markdown code blocks or any text outside the JSON object.`;

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
          { role: 'user', content: `Original problem: ${problem_text}\n\nPlease generate 4 similar practice problems with brief answers in the same language as the original problem.` }
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
