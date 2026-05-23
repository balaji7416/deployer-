create extension if not exists "pgcrypto";

create table if not exists deployments (
    id uuid primary key default gen_random_uuid(),
     
    repo_url text not null, 
    repo_name text, 
    
    status text check (status in ('queued', 'cloning','building', 'starting','running','failed','stopped')),
    port integer,

    container_name text , 
    image_name text, 

    runtime_type text check (runtime_type in ('static','node','python','dockerfile')),
    build_logs text, 
    run_logs text, 

    created_at timestamp default now(), 
    updated_at timestamp default now()
);