import { supabase } from '@/integrations/supabase/client';
import { mySupabase } from '@/integrations/supabase/mySupabase';

export type StoryType =
  | 'gap_today'
  | 'whisper_moment'
  | 'breakthrough'
  | 'course_complete'
  | 'team_milestone';

export type StoryVisibility = 'private' | 'friends' | 'public';

export interface BoostaStory {
  id: string;
  user_id: string;
  story_type: StoryType;
  payload: Record<string, unknown>;
  visibility: StoryVisibility;
  created_at: string;
}

const sb = supabase as any;

export async function publishStory(
  storyType: StoryType,
  payload: Record<string, unknown>,
  visibility: StoryVisibility = 'friends',
): Promise<BoostaStory | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Не авторизован');
  const storyPayload = { user_id: user.id, story_type: storyType, payload, visibility };
  const { data, error } = await sb
    .from('boosta_stories')
    .insert(storyPayload)
    .select('*')
    .maybeSingle();
  if (error) throw error;
  if (mySupabase) {
    (mySupabase as any).from('boosta_stories').insert(storyPayload)
      .then()
      .catch((e: unknown) => console.warn('[dual] insert boosta_stories:', e));
  }
  return data as BoostaStory;
}

export async function listMyStories(): Promise<BoostaStory[]> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await sb
    .from('boosta_stories')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(20);
  return (data ?? []) as BoostaStory[];
}

export async function listFriendStories(userId: string): Promise<BoostaStory[]> {
  const { data } = await sb
    .from('boosta_stories')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(10);
  return (data ?? []) as BoostaStory[];
}
