import { supabase } from "@/app/lib/supabase";

export async function saveDecision(text: string) {
  if (!supabase) {
    console.warn("Supabase is not configured; skipping decision persistence.");
    return null;
  }

  try {
    const { data, error } = await supabase
      .from("decisions")
      .insert([{ decision_text: text }]);

    if (error) throw error;

    return data;
  } catch (error) {
    console.warn("Unable to save decision to Supabase:", error);
    return null;
  }
}

export async function getRecentDecisions() {
  if (!supabase) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from("decisions")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(5);

    if (error) throw error;

    return data ?? [];
  } catch (error) {
    console.warn("Unable to fetch recent decisions:", error);
    return [];
  }
}