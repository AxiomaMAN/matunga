-- Chat messages for online matunga rooms
CREATE TABLE public.matunga_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id uuid NOT NULL REFERENCES public.matunga_rooms(id) ON DELETE CASCADE,
  player_id text NOT NULL,
  player_color text NOT NULL CHECK (player_color IN ('white','black')),
  kind text NOT NULL CHECK (kind IN ('text','emoji')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_matunga_messages_room_created ON public.matunga_messages(room_id, created_at);

ALTER TABLE public.matunga_messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "anyone can read messages" ON public.matunga_messages FOR SELECT USING (true);
CREATE POLICY "anyone can insert messages" ON public.matunga_messages FOR INSERT WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.matunga_messages;
ALTER TABLE public.matunga_messages REPLICA IDENTITY FULL;