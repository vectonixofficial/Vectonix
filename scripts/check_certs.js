const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');

const supabaseUrl = 'https://asrnrvsfbogrgspixyvg.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFzcm5ydnNmYm9ncmdzcGl4eXZnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMwMDU3NTMsImV4cCI6MjA5ODU4MTc1M30.Qb-lgMU3xRRomdrlDeUCtpDoiK82YNjAlwbr0c-kYw0';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabaseCerts() {
    const { data, count, error } = await supabase
        .from('certificates')
        .select('*', { count: 'exact' });
    
    console.log("Supabase Current Certificates Count:", count);
    if (data) {
        console.log("Existing IDs:", data.map(d => d.certificate_id).join(", "));
    }
}

checkSupabaseCerts();
