import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SubmitAttemptRequest {
  user_id: string;
  problem_id: string;
  is_correct: boolean;
  user_answer: string;
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Parse request body
    const body: SubmitAttemptRequest = await req.json();
    const { user_id, problem_id, is_correct, user_answer } = body;

    // Validate input
    if (!user_id || !problem_id || typeof is_correct !== 'boolean' || !user_answer) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: user_id, problem_id, is_correct, user_answer' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Processing attempt for user ${user_id}, problem ${problem_id}, correct: ${is_correct}`);

    // 1) Fetch problem
    const { data: problem, error: problemError } = await supabase
      .from('problems')
      .select('subject, rating')
      .eq('id', problem_id)
      .single();

    if (problemError || !problem) {
      console.error('Problem fetch error:', problemError);
      return new Response(
        JSON.stringify({ error: 'Problem not found', details: problemError?.message }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Problem: subject=${problem.subject}, rating=${problem.rating}`);

    // 2) Fetch or create user_ratings
    let { data: userRating, error: ratingError } = await supabase
      .from('user_ratings')
      .select('*')
      .eq('user_id', user_id)
      .maybeSingle();

    if (ratingError) {
      console.error('User rating fetch error:', ratingError);
      return new Response(
        JSON.stringify({ error: 'Failed to fetch user rating', details: ratingError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // If user_rating doesn't exist, create it
    if (!userRating) {
      const { data: newRating, error: createError } = await supabase
        .from('user_ratings')
        .insert({
          user_id,
          total_rating: 1200,
          math_rating: 1200,
          physics_rating: 1200,
          programming_rating: 1200,
          streak_days: 0,
          solved_count: 0,
        })
        .select()
        .single();

      if (createError || !newRating) {
        console.error('Failed to create user rating:', createError);
        return new Response(
          JSON.stringify({ error: 'Failed to create user rating', details: createError?.message }),
          { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      userRating = newRating;
      console.log('Created new user rating entry');
    }

    // 3) Determine subject rating field
    const subjectRatingField = `${problem.subject}_rating` as 'math_rating' | 'physics_rating' | 'programming_rating';
    const R_user = userRating[subjectRatingField] || 1200;
    const R_problem = problem.rating;

    console.log(`Current ${subjectRatingField}: ${R_user}`);

    // 4) Compute ELO
    const expectedScore = 1 / (1 + Math.pow(10, (R_problem - R_user) / 400));
    const actualScore = is_correct ? 1 : 0;

    let K = 40;
    if (R_user >= 2000) K = 10;
    else if (R_user >= 1400) K = 20;

    const R_new = Math.round(R_user + K * (actualScore - expectedScore));
    const delta = R_new - R_user;

    console.log(`ELO calculation: E=${expectedScore.toFixed(3)}, S=${actualScore}, K=${K}, R_new=${R_new}, delta=${delta}`);

    // 5) Update user_ratings
    const updatedRatings = {
      [subjectRatingField]: R_new,
      math_rating: problem.subject === 'math' ? R_new : userRating.math_rating,
      physics_rating: problem.subject === 'physics' ? R_new : userRating.physics_rating,
      programming_rating: problem.subject === 'programming' ? R_new : userRating.programming_rating,
    };

    const total_rating = Math.round(
      (updatedRatings.math_rating + updatedRatings.physics_rating + updatedRatings.programming_rating) / 3
    );

    // 6) Streak logic
    const now = new Date();
    const lastSolved = userRating.last_solved_at ? new Date(userRating.last_solved_at) : null;
    
    let streak_days = userRating.streak_days || 0;
    
    if (!lastSolved) {
      // First solve
      streak_days = 1;
    } else {
      const daysSinceLastSolved = Math.floor((now.getTime() - lastSolved.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysSinceLastSolved === 0) {
        // Solved today already, keep streak
        streak_days = streak_days;
      } else if (daysSinceLastSolved === 1) {
        // Solved yesterday, increment streak
        streak_days += 1;
      } else {
        // Gap > 1 day, reset streak
        streak_days = 1;
      }
    }

    const solved_count = (userRating.solved_count || 0) + 1;

    console.log(`Updating ratings: total=${total_rating}, streak=${streak_days}, solved=${solved_count}`);

    const { error: updateError } = await supabase
      .from('user_ratings')
      .update({
        ...updatedRatings,
        total_rating,
        streak_days,
        solved_count,
        last_solved_at: now.toISOString(),
      })
      .eq('user_id', user_id);

    if (updateError) {
      console.error('Failed to update user rating:', updateError);
      return new Response(
        JSON.stringify({ error: 'Failed to update user rating', details: updateError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // 7) Insert into problem_attempts
    const { error: attemptError } = await supabase
      .from('problem_attempts')
      .insert({
        user_id,
        problem_id,
        subject: problem.subject,
        is_correct,
        user_answer,
        rating_before: R_user,
        rating_after: R_new,
        delta,
      });

    if (attemptError) {
      console.error('Failed to insert problem attempt:', attemptError);
      // Non-fatal, continue
    }

    // 8) Return success response
    const response = {
      success: true,
      rating_before: R_user,
      rating_after: R_new,
      delta,
      total_rating,
      subject_rating: R_new,
      streak_days,
      solved_count,
    };

    console.log('Attempt processed successfully:', response);

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Unexpected error:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: 'Internal server error', details: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

