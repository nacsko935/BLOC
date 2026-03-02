-- ================================================================
-- BLOC — PATCH MESSAGERIE RÉSEAU v1
-- À exécuter dans : Supabase > SQL Editor > New Query > Run
-- Ce script corrige et complète le système de messagerie
-- ================================================================

-- ── 1. Corriger la contrainte UNIQUE sur conversations ────────────
-- La contrainte unique (participant_a, participant_b) bloque les DM
-- si l'utilisateur A essaie d'écrire à B quand B avait écrit à A en premier.
-- On la remplace par une contrainte ordonnée (least, greatest).

ALTER TABLE public.conversations DROP CONSTRAINT IF EXISTS conversations_participant_a_participant_b_key;

-- Supprimer les doublons éventuels avant d'ajouter la nouvelle contrainte
DELETE FROM public.conversations a
USING public.conversations b
WHERE a.id > b.id
  AND (
    (a.participant_a = b.participant_a AND a.participant_b = b.participant_b)
    OR
    (a.participant_a = b.participant_b AND a.participant_b = b.participant_a)
  );

-- Nouvelle contrainte qui considère (A,B) == (B,A)
CREATE UNIQUE INDEX IF NOT EXISTS conversations_pair_unique
  ON public.conversations (
    LEAST(participant_a::text, participant_b::text),
    GREATEST(participant_a::text, participant_b::text)
  );

-- ── 2. Corriger les politiques RLS des group_messages ────────────
-- La politique actuelle référence `group_id` sans qualifier la table,
-- ce qui peut causer une erreur d'ambiguïté dans PostgreSQL.

DROP POLICY IF EXISTS "group_messages_select" ON public.group_messages;
DROP POLICY IF EXISTS "group_messages_insert" ON public.group_messages;

CREATE POLICY "group_messages_select" ON public.group_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = public.group_messages.group_id
        AND gm.user_id = auth.uid()
    )
  );

CREATE POLICY "group_messages_insert" ON public.group_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.group_members gm
      WHERE gm.group_id = public.group_messages.group_id
        AND gm.user_id = auth.uid()
    )
  );

-- ── 3. Activer Realtime sur les tables de messagerie ─────────────
-- Sans ça, les abonnements Supabase Realtime ne reçoivent rien.

ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.conversations;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.group_members;

-- ── 4. Corriger la politique conversations INSERT ─────────────────
-- La politique actuelle autorise l'insert si l'user est participant_a OU participant_b.
-- Mais lors de la création, l'user doit forcément être participant_a.
-- On s'assure aussi que l'user ne peut pas créer une conv avec lui-même.

DROP POLICY IF EXISTS "conversations_insert" ON public.conversations;

CREATE POLICY "conversations_insert" ON public.conversations
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = participant_a
    AND participant_a <> participant_b
  );

-- ── 5. Ajouter la politique DELETE sur conversations ─────────────
-- Permet à un participant de supprimer une conversation (optionnel)

DROP POLICY IF EXISTS "conversations_delete" ON public.conversations;
-- Non implémenté volontairement pour conserver l'historique.

-- ── 6. Index supplémentaires pour performance ─────────────────────

CREATE INDEX IF NOT EXISTS idx_messages_created_at
  ON public.messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_group_messages_created_at
  ON public.group_messages(created_at ASC);

CREATE INDEX IF NOT EXISTS idx_conversations_participants
  ON public.conversations(participant_a, participant_b);

-- ── 7. Fonction RPC pour créer ou récupérer une conversation DM ──
-- Cette fonction est atomique et évite les race conditions côté client.

DROP FUNCTION IF EXISTS public.get_or_create_dm(uuid);

CREATE OR REPLACE FUNCTION public.get_or_create_dm(other_user_id uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid;
  v_conv_id uuid;
BEGIN
  v_user_id := auth.uid();

  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  IF v_user_id = other_user_id THEN
    RAISE EXCEPTION 'Cannot create conversation with yourself';
  END IF;

  -- Chercher conversation existante dans les deux sens
  SELECT id INTO v_conv_id
  FROM public.conversations
  WHERE (participant_a = v_user_id AND participant_b = other_user_id)
     OR (participant_a = other_user_id AND participant_b = v_user_id)
  LIMIT 1;

  -- Si elle existe, la retourner
  IF v_conv_id IS NOT NULL THEN
    RETURN v_conv_id;
  END IF;

  -- Sinon créer
  INSERT INTO public.conversations (participant_a, participant_b)
  VALUES (v_user_id, other_user_id)
  RETURNING id INTO v_conv_id;

  RETURN v_conv_id;
END;
$$;

-- Accorder le droit d'exécution aux utilisateurs authentifiés
GRANT EXECUTE ON FUNCTION public.get_or_create_dm(uuid) TO authenticated;

-- ── 8. Vérification finale ────────────────────────────────────────

SELECT
  'conversations' as table_name,
  COUNT(*) as row_count
FROM public.conversations

UNION ALL

SELECT
  'messages',
  COUNT(*)
FROM public.messages

UNION ALL

SELECT
  'groups',
  COUNT(*)
FROM public.groups

UNION ALL

SELECT
  'group_members',
  COUNT(*)
FROM public.group_members

UNION ALL

SELECT
  'group_messages',
  COUNT(*)
FROM public.group_messages;

SELECT 'BLOC Messagerie PATCH appliqué avec succès ✅' as status;
