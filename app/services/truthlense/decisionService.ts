import { supabase } from "@/app/lib/supabase";

export async function saveDecision(text: string) {
  const { data, error } = await supabase
    .from("decisions")
    .insert([{ decision_text: text }]);

  if (error) throw error;

  return data;
}

export async function getRecentDecisions() {
  const { data, error } = await supabase
    .from("decisions")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5);

  if (error) throw error;

  return data;
}