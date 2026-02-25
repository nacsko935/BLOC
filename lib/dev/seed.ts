import { getSupabaseOrThrow } from "../supabase";
import { getMyProfile } from "../services/profileService";

export async function seedPosts(n = 10) {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Connecte-toi avant de seed.");

  const profile = await getMyProfile().catch(() => null);
  const filiere = profile?.filiere || "Informatique";

  const payload = Array.from({ length: n }).map((_, index) => ({
    author_id: userId,
    filiere,
    title: `Post test ${index + 1}`,
    content: `Contenu de test #${index + 1} pour valider le feed Supabase dans BLOC.`,
    type: index % 3 === 0 ? "qcm" : index % 2 === 0 ? "pdf" : "text",
    attachment_url: null,
  }));

  const { error: insertError } = await supabase.from("posts").insert(payload);
  if (insertError) throw insertError;

  return n;
}
