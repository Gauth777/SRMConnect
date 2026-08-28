-- Lock the helper function's search path to avoid mutable search_path risks.
alter function public.set_updated_at() set search_path = '';
