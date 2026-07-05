-- insert into deployments (repo_url) values
-- ('https://github.com/username/repo.git');

-- select * from deployments; 

-- alter table deployments 
-- add column error_message text; 

------- for adding spa in check constraint 
-- ALTER TABLE deployments 
-- DROP CONSTRAINT deployments_runtime_type_check;

-- ALTER TABLE deployments 
-- ADD CONSTRAINT deployments_runtime_type_check 
-- CHECK (runtime_type IN ('static', 'node', 'python', 'spa', 'dockerfile', 'unknown'));

-- alter table deployments
-- drop column port; 


-- delete from deployments;

-- alter table deployments
-- drop column port;

-- alter table deployments
-- add column route text unique;

-- alter table deployments
-- add column user_id uuid references users(id);

-- SELECT
--     column_name,
--     data_type,
--     is_nullable
-- FROM information_schema.columns
-- WHERE table_name = 'deployments';


-- alter table deployments
-- drop column build_logs;

-- alter table deployments
-- add column logs text;

-- alter table deployments
-- drop column run_logs;

-- delete from deployments; 



-- alter table deployments
-- add column root_dir text; 

-- alter table deployments
-- drop constraint deployments_status_check; 

-- alter table deployments 
-- add constraint deployments_status_check
-- check (status in ('queued', 'cloning','building', 'starting','running','failed','stopped','restarting'));

-- alter table env_variables
-- drop constraint env_variables_deployment_id_fkey;

-- alter table env_variables
-- add constraint env_variables_deployment_id_fkey
-- foreign key (deployment_id) references deployments(id) on delete cascade;

select * from deployments; 