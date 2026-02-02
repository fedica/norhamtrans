
import { createClient } from '@supabase/supabase-js';

// Configuration - Use your actual Supabase details
// Replace the placeholders with your project's details
const supabaseUrl = 'https://your-project-url.supabase.co'; 
const supabaseAnonKey = 'your-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const db = {
  async upsert(table: string, data: any) {
    const { error } = await supabase.from(table).upsert(data);
    if (error) throw error;
  },
  async update(table: string, id: string, data: any) {
    const { error } = await supabase.from(table).update(data).eq('id', id);
    if (error) throw error;
  },
  async delete(table: string, id: string) {
    const { error } = await supabase.from(table).delete().eq('id', id);
    if (error) throw error;
  },
  async select(table: string, query = '*') {
    const { data, error } = await supabase.from(table).select(query);
    if (error) throw error;
    return data;
  }
};
