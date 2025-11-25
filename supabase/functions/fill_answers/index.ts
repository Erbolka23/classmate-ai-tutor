import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Problem {
  id: string;
  statement: string;
  subject: string;
  difficulty: string;
}

const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

const callLovableAI = async (statement: string): Promise<string | null> => {
  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  
  if (!LOVABLE_API_KEY) {
    console.error('LOVABLE_API_KEY not configured');
    return null;
  }

  try {
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          {
            role: 'system',
            content: 'You are a problem solver. Return ONLY the final answer as a number or short text. No explanation, no units, no extra words. Just the answer.'
          },
          {
            role: 'user',
            content: `Solve this problem and return ONLY the final answer:\n\n${statement}`
          }
        ],
        temperature: 0.3,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`AI API error (${response.status}):`, errorText);
      return null;
    }

    const data = await response.json();
    const answer = data.choices?.[0]?.message?.content?.trim();
    
    if (!answer) {
      console.error('No answer received from AI');
      return null;
    }

    // Clean the answer - remove extra text, keep only the core answer
    const cleaned = answer
      .replace(/^(Answer:|The answer is:?|Result:?)\s*/i, '')
      .replace(/\.$/, '')
      .trim();

    return cleaned;
  } catch (error) {
    console.error('Error calling Lovable AI:', error);
    return null;
  }
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log('Starting fill_answers process...');

    // Get all problems without correct_answer
    const { data: problems, error: fetchError } = await supabase
      .from('problems')
      .select('id, statement, subject, difficulty')
      .is('correct_answer', null)
      .limit(100); // Process max 100 at a time

    if (fetchError) {
      console.error('Error fetching problems:', fetchError);
      throw fetchError;
    }

    if (!problems || problems.length === 0) {
      console.log('No problems found without answers');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'All problems already have answers',
          processed: 0,
          succeeded: 0,
          failed: 0
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Found ${problems.length} problems without answers`);

    let succeeded = 0;
    let failed = 0;

    // Process each problem with rate limiting
    for (const problem of problems as Problem[]) {
      console.log(`Processing problem ${problem.id} (${problem.subject}/${problem.difficulty})`);
      
      try {
        const answer = await callLovableAI(problem.statement);
        
        if (answer) {
          // Update the problem with the answer
          const { error: updateError } = await supabase
            .from('problems')
            .update({ correct_answer: answer })
            .eq('id', problem.id);

          if (updateError) {
            console.error(`Failed to update problem ${problem.id}:`, updateError);
            failed++;
          } else {
            console.log(`✓ Successfully updated problem ${problem.id} with answer: ${answer}`);
            succeeded++;
          }
        } else {
          console.warn(`✗ Could not generate answer for problem ${problem.id}`);
          failed++;
        }
      } catch (error) {
        console.error(`Error processing problem ${problem.id}:`, error);
        failed++;
      }

      // Rate limiting: 3 requests per second = ~350ms delay
      await sleep(350);
    }

    console.log(`Process completed. Succeeded: ${succeeded}, Failed: ${failed}`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${problems.length} problems`,
        processed: problems.length,
        succeeded,
        failed
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in fill_answers function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Unknown error',
        success: false 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});
