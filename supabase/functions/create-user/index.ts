import { createClient } from 'jsr:@supabase/supabase-js@2'

const ALLOWED_ROLES = ['user', 'admin', 'superadmin']

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return json({ error: 'Missing Authorization header' }, 401)
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')

    // Client scoped to the caller's own JWT — used only to find out who is calling.
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return json({ error: 'Invalid session' }, 401)
    }

    // Admin client — has full privileges. Only used after the caller is verified below.
    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    const { data: callerRoleRow } = await adminClient
      .from('user_roles')
      .select('role')
      .eq('user_id', caller.id)
      .single()

    const callerRole = callerRoleRow?.role
    if (!callerRole || !['admin', 'superadmin'].includes(callerRole)) {
      return json({ error: 'Not authorized. Admin or Superadmin only.' }, 403)
    }

    const { email, password, role = 'admin', sendInvite = false } = await req.json()

    if (!email) return json({ error: 'Email is required' }, 400)
    if (!ALLOWED_ROLES.includes(role)) return json({ error: 'Invalid role' }, 400)
    if (role === 'superadmin' && callerRole !== 'superadmin') {
      return json({ error: 'Only a Superadmin can create another Superadmin' }, 403)
    }
    if (!sendInvite && (!password || password.length < 8)) {
      return json({ error: 'Password must be at least 8 characters' }, 400)
    }

    // Create the login itself
    let newUser
    if (sendInvite) {
      const { data, error } = await adminClient.auth.admin.inviteUserByEmail(email)
      if (error) return json({ error: error.message }, 400)
      newUser = data.user
    } else {
      const { data, error } = await adminClient.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
      })
      if (error) return json({ error: error.message }, 400)
      newUser = data.user
    }

    // Assign the role
    const { error: roleError } = await adminClient
      .from('user_roles')
      .upsert({ user_id: newUser.id, role }, { onConflict: 'user_id' })

    if (roleError) return json({ error: `User created but role assignment failed: ${roleError.message}` }, 500)

    return json({
      success: true,
      user: { id: newUser.id, email: newUser.email, role },
      invited: sendInvite,
    })
  } catch (err) {
    return json({ error: err.message || 'Unexpected error' }, 500)
  }
})

function json(body, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
