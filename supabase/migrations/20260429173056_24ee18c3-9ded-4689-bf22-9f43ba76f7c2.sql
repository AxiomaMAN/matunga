CREATE OR REPLACE FUNCTION public.join_matunga_room(_code text, _player_id text)
RETURNS public.matunga_rooms
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  r public.matunga_rooms;
BEGIN
  SELECT * INTO r FROM public.matunga_rooms WHERE code = _code;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'room_not_found';
  END IF;

  -- already in the room
  IF r.player_white = _player_id OR r.player_black = _player_id THEN
    RETURN r;
  END IF;

  -- take open seat (white first, then black)
  IF r.player_white IS NULL THEN
    UPDATE public.matunga_rooms
       SET player_white = _player_id, updated_at = now()
     WHERE id = r.id AND player_white IS NULL
     RETURNING * INTO r;
    IF FOUND THEN RETURN r; END IF;
  END IF;

  IF r.player_black IS NULL THEN
    UPDATE public.matunga_rooms
       SET player_black = _player_id, updated_at = now()
     WHERE id = r.id AND player_black IS NULL
     RETURNING * INTO r;
    IF FOUND THEN RETURN r; END IF;
  END IF;

  -- room full, return current state (spectator)
  SELECT * INTO r FROM public.matunga_rooms WHERE code = _code;
  RETURN r;
END;
$$;

GRANT EXECUTE ON FUNCTION public.join_matunga_room(text, text) TO anon, authenticated;