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