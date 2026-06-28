-- Initialize all per-service databases
CREATE DATABASE auth_db;
CREATE DATABASE order_db;
CREATE DATABASE inventory_db;
CREATE DATABASE pos_db;
CREATE DATABASE customer_db;

-- Grant privileges
GRANT ALL PRIVILEGES ON DATABASE auth_db TO saas_user;
GRANT ALL PRIVILEGES ON DATABASE order_db TO saas_user;
GRANT ALL PRIVILEGES ON DATABASE inventory_db TO saas_user;
GRANT ALL PRIVILEGES ON DATABASE pos_db TO saas_user;
GRANT ALL PRIVILEGES ON DATABASE customer_db TO saas_user;
