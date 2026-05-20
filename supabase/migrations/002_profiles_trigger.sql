-- Auto-create a profile row when a new user signs up via Supabase Auth.
-- Reads role from raw_user_meta_data (set during signInWithOtp call).

create or replace function public.handle_new_user()
returns trigger
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, role, company_name)
  values (
    new.id,
    new.email,
    coalesce(
      (new.raw_user_meta_data->>'role')::public.user_role,
      'retailer'
    ),
    coalesce(new.raw_user_meta_data->>'company_name', '')
  );
  return new;
end;
$$ language plpgsql;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
