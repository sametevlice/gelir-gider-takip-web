const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './.env' });

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

async function check() {
  console.log('Checking Supabase connection...');
  const { data: txData, error: txError } = await supabase.from('transactions').select('type').limit(1);
  console.log('Transactions table:', txError ? 'Error/Not found' : 'Exists');
  
  const { data: invData, error: invError } = await supabase.from('investments').select('*').limit(1);
  console.log('Investments table:', invError ? 'Error/Not found' : 'Exists');
  
  if (!txError) {
    const { data } = await supabase.from('transactions').select('type');
    const types = [...new Set(data.map(t => t.type))];
    console.log('Unique types in transactions DB:', types);
  }
}

check();
