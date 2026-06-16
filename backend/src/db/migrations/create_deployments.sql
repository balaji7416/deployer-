create extension if not exists "pgcrypto";

create table if not exists deployments (
    id uuid primary key default gen_random_uuid(),
    
    user_id uuid foreign key references users(id),

    repo_url text not null, 
    repo_name text, 
    
    status text check (status in ('queued', 'cloning','building', 'starting','running','failed','stopped')),
    -- port integer,
    route text unique,
    
    container_name text , 
    image_name text, 

    runtime_type text check (runtime_type in ('static','node','python','dockerfile','spa','unknown')),
    build_logs text, 
    run_logs text, 
    error_message text, 
    
    created_at timestamp default now(), 
    updated_at timestamp default now()
);

create table if not exists users (
    id uuid primary key default gen_random_uuid(),

    username text unique not null, 
    password text not null, 
    email text unique not null, 

    created_at timestamp default now(), 
    updated_at timestamp default now()
);