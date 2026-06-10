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


-- -- delete from deployments;

-- alter table deployments
-- drop column port;

-- alter table deployments
-- add column route text unique;


SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'deployments';

