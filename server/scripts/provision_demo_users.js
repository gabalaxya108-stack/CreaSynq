// server/scripts/provision_demo_users.js
// Administrative script to provision dedicated Brand & Creator demo accounts in Supabase Auth
// Uses official Supabase Admin API (createUser with email_confirm: true)
// Safe: Runs ONLY server-side; NEVER exposed to the frontend/browser bundle.

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

// Parse .env
let envConfig = {};
try {
  const envContent = fs.readFileSync('.env', 'utf8');
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const key = trimmed.substring(0, idx).trim();
        const val = trimmed.substring(idx + 1).trim();
        envConfig[key] = val;
      }
    }
  });
} catch (e) {
  console.warn('Could not read .env file directly:', e.message);
}

const supabaseUrl = envConfig.VITE_SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const serviceRoleKey = envConfig.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = envConfig.VITE_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY;

console.log('================================================================');
console.log('ALLOY DEMO ACCOUNT PROVISIONING');
console.log('================================================================');
console.log('Project URL:', supabaseUrl);

const DEMO_USERS = [
  {
    email: 'lumina.demo@alloy.market',
    password: 'AlloyDemo2026!',
    displayName: 'Lumina Botanica',
    role: 'brand',
    profileId: 'brand-demo-lumina'
  },
  {
    email: 'maya.demo@alloy.market',
    password: 'AlloyDemo2026!',
    displayName: 'Maya Chen',
    role: 'creator',
    profileId: 'maya-chen'
  }
];

async function provision() {
  if (!supabaseUrl) {
    console.error('❌ VITE_SUPABASE_URL is missing in .env');
    process.exit(1);
  }

  if (serviceRoleKey) {
    console.log('🔑 Found SUPABASE_SERVICE_ROLE_KEY. Using Admin API...');
    const adminClient = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false }
    });

    for (const userDef of DEMO_USERS) {
      console.log(`\nProvisioning ${userDef.displayName} (${userDef.email})...`);
      
      // Check if user exists in Auth
      const { data: { users }, error: listErr } = await adminClient.auth.admin.listUsers();
      if (listErr) {
        console.error('Error listing users:', listErr.message);
      }
      
      const existing = (users || []).find(u => u.email?.toLowerCase() === userDef.email.toLowerCase());
      let authUserId = existing?.id;

      if (!existing) {
        const { data: createData, error: createErr } = await adminClient.auth.admin.createUser({
          email: userDef.email,
          password: userDef.password,
          email_confirm: true,
          user_metadata: {
            display_name: userDef.displayName,
            full_name: userDef.displayName,
            role: userDef.role,
            intended_role: userDef.role
          }
        });

        if (createErr) {
          console.error(`❌ Could not create user ${userDef.email}:`, createErr.message);
          continue;
        }
        authUserId = createData.user.id;
        console.log(`✅ Created Auth user: ${authUserId}`);
      } else {
        console.log(`ℹ️ User already exists in Auth: ${authUserId}. Updating password & confirmed status...`);
        await adminClient.auth.admin.updateUserById(authUserId, {
          password: userDef.password,
          email_confirm: true,
          user_metadata: {
            display_name: userDef.displayName,
            full_name: userDef.displayName,
            role: userDef.role,
            intended_role: userDef.role
          }
        });
        console.log(`✅ Updated password & confirmed status for ${userDef.email}`);
      }

      // Upsert profile in public.profiles
      const { error: profErr } = await adminClient.from('profiles').upsert({
        id: authUserId,
        email: userDef.email,
        role: userDef.role,
        display_name: userDef.displayName,
        updated_at: new Date().toISOString()
      });

      if (profErr) {
        console.warn(`⚠️ Profile sync note for ${userDef.email}:`, profErr.message);
      } else {
        console.log(`✅ Synced public.profiles entry for ${userDef.displayName}`);
      }
    }

    console.log('\n🎉 ALL DEMO ACCOUNTS PROVISIONED SUCCESSFULLY VIA ADMIN API!');
  } else {
    console.log('ℹ️ SUPABASE_SERVICE_ROLE_KEY is not set in .env.');
    console.log('Attempting self-registration via public Anon client (requires email confirmations disabled in dashboard)...');
    
    const client = createClient(supabaseUrl, anonKey);

    for (const userDef of DEMO_USERS) {
      console.log(`\nTesting sign in for ${userDef.email}...`);
      const { data: signInData, error: signInErr } = await client.auth.signInWithPassword({
        email: userDef.email,
        password: userDef.password
      });

      if (!signInErr && signInData.user) {
        console.log(`✅ Account already active and functional! (ID: ${signInData.user.id})`);
      } else {
        console.log(`Signing up ${userDef.email}...`);
        const { data: signUpData, error: signUpErr } = await client.auth.signUp({
          email: userDef.email,
          password: userDef.password,
          options: {
            data: {
              display_name: userDef.displayName,
              role: userDef.role,
              intended_role: userDef.role
            }
          }
        });

        if (signUpErr) {
          console.log(`⚠️ Sign up response: ${signUpErr.message} (status: ${signUpErr.status})`);
        } else {
          console.log(`✅ Sign up request succeeded for ${userDef.email}! (User ID: ${signUpData.user?.id})`);
        }
      }
    }
  }
}

provision().catch(console.error);
