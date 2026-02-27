import AsyncStorage from "@react-native-async-storage/async-storage";
import { getSupabaseOrThrow } from "../supabase";
import { getMyProfile } from "../services/profileService";

const INITIAL_SEED_FLAG = "bloc:initial_seed_v1_done";

const FILIERES = ["Informatique", "Commerce", "Droit", "Sante", "Prepa"] as const;

const POST_TEMPLATES = [
  { title: "Plan de revision efficace", content: "Methode 45/15: 45 min focus, 15 min recap. Je fais 3 cycles par matiere.", type: "text" },
  { title: "Fiche memo SQL", content: "SELECT, JOIN, GROUP BY, HAVING. J'ai mis les patterns les plus utiles pour les partiels.", type: "pdf" },
  { title: "QCM express marketing", content: "15 questions pour revoir le positionnement, la segmentation et le parcours client.", type: "qcm" },
  { title: "Conseils alternance", content: "Portfolio simple + 2 projets concrets + pitch 45 sec. C'est ce qui m'a aide en entretien.", type: "text" },
  { title: "Methodo dissertation", content: "Problematique claire, plan en 2 parties, transitions courtes. Le correcteur veut de la structure.", type: "text" },
  { title: "Revisions anatomie", content: "Je revise par schema + repetition active. 20 min par systeme, puis auto quiz.", type: "pdf" },
  { title: "Routine prepa", content: "Bloc de maths le matin, physique l'aprem, correction le soir. Regulier > intensif.", type: "text" },
  { title: "Stage & CV checklist", content: "CV 1 page, resultats chiffres, GitHub ou dossier projets, lettre courte.", type: "text" },
  { title: "Fiche droit penal", content: "Elements constitutifs, qualification, sanctions. Format ideal pour revision rapide.", type: "pdf" },
  { title: "Motivation semaine partiels", content: "Objectif minimal quotidien + mini victoire. On garde le rythme sans surchauffe.", type: "text" },
] as const;

const DEFAULT_GROUPS = [
  "L1 Informatique",
  "Alternants Commerce",
  "Prepa Maths",
  "Methodo dissertation",
  "Stage & CV",
  "Revisions partiels",
];

const DEMO_PROFILES = [
  { username: "leo_l2", full_name: "Leo Martin", niveau: "L2", bio: "Etudiant L2, fan de methodes claires." },
  { username: "ines_alt", full_name: "Ines Benali", niveau: "Alternant", bio: "Alternance marketing, tips CV/entretien." },
  { username: "sarah_prepa", full_name: "Sarah Dupuis", niveau: "Prepa", bio: "Prepa MPSI, revision quotidienne et entraide." },
];

async function requireUserId() {
  const supabase = getSupabaseOrThrow();
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const userId = data.user?.id;
  if (!userId) throw new Error("Connecte-toi avant de generer du contenu.");
  return userId;
}

async function countRows(table: string) {
  const supabase = getSupabaseOrThrow();
  const { count, error } = await supabase.from(table).select("*", { count: "exact", head: true });
  if (error) throw error;
  return count ?? 0;
}

export async function seedPosts(n = 10) {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();
  const profile = await getMyProfile().catch(() => null);
  const filiere = profile?.filiere || "Informatique";

  const payload = Array.from({ length: n }).map((_, index) => {
    const template = POST_TEMPLATES[index % POST_TEMPLATES.length];
    return {
      author_id: userId,
      filiere,
      title: `${template.title} #${index + 1}`,
      content: template.content,
      type: template.type,
      attachment_url: null,
    };
  });

  const { error: insertError } = await supabase.from("posts").insert(payload);
  if (insertError) throw insertError;
  return n;
}

export async function seedInitialContent() {
  const supabase = getSupabaseOrThrow();
  const userId = await requireUserId();

  const profilePatch = DEMO_PROFILES[Math.floor(Math.random() * DEMO_PROFILES.length)];
  await supabase.from("profiles").upsert({
    id: userId,
    username: profilePatch.username,
    full_name: profilePatch.full_name,
    niveau: profilePatch.niveau,
    bio: profilePatch.bio,
  });

  const postPayload = Array.from({ length: 20 }).map((_, idx) => {
    const template = POST_TEMPLATES[idx % POST_TEMPLATES.length];
    const filiere = FILIERES[idx % FILIERES.length];
    return {
      author_id: userId,
      filiere,
      title: template.title,
      content: template.content,
      type: template.type,
      attachment_url: null,
    };
  });

  const { error: postsError } = await supabase.from("posts").insert(postPayload);
  if (postsError) throw postsError;

  const groupRows = DEFAULT_GROUPS.map((name, idx) => ({
    type: "group",
    title: name,
    description: `Groupe de travail ${name.toLowerCase()} pour revisions et entraide.`,
    filiere: FILIERES[idx % FILIERES.length],
    privacy: idx % 3 === 0 ? "private" : "public",
    avatar_color: ["#6E5CFF", "#2C7BFF", "#FF5C7A", "#00A884", "#F59E0B", "#6366F1"][idx % 6],
    created_by: userId,
  }));

  const { data: groups, error: groupsError } = await supabase
    .from("conversations")
    .insert(groupRows)
    .select("id");
  if (groupsError) throw groupsError;

  if (groups?.length) {
    const memberships = groups.map((g) => ({ conversation_id: g.id, user_id: userId }));
    const { error: memberError } = await supabase
      .from("conversation_members")
      .upsert(memberships, { onConflict: "conversation_id,user_id" });
    if (memberError) throw memberError;
  }

  await AsyncStorage.setItem(INITIAL_SEED_FLAG, "1");
  return { posts: postPayload.length, groups: groupRows.length, profiles: DEMO_PROFILES.length };
}

export async function seedInitialContentIfEmptyDev() {
  if (!__DEV__) return null;
  const done = await AsyncStorage.getItem(INITIAL_SEED_FLAG);
  if (done === "1") return null;

  const [postsCount, groupsCount] = await Promise.all([countRows("posts"), countRows("conversations")]);
  if (postsCount > 0 || groupsCount > 0) {
    await AsyncStorage.setItem(INITIAL_SEED_FLAG, "1");
    return null;
  }

  return seedInitialContent();
}
