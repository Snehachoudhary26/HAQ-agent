create table applications (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,               -- Firebase uid or Supabase auth user id
  scheme_id text not null,             -- matches an id in schemes.json
  scheme_name text not null,
  status text not null default 'submitted',  -- submitted | action_required | approved | rejected
  next_step text,                      -- e.g. "Income certificate is missing"
  reference_no text,                   -- e.g. AICTE-PRG-2026-009921
  submitted_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table application_documents (
  id uuid default gen_random_uuid() primary key,
  application_id uuid references applications(id) on delete cascade,
  document_type text not null,         -- e.g. 'income_certificate', 'aadhaar_card'
  status text not null default 'missing',   -- missing | uploaded | verified | rejected
  storage_path text,                   -- set once uploaded to Supabase Storage
  uploaded_at timestamptz,
  reviewed_at timestamptz,
  reviewed_by text                     -- admin identifier, once you have an admin login
);

create index idx_applications_user on applications(user_id);
create index idx_documents_application on application_documents(application_id);
