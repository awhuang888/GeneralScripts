-- create snapshot
CREATE DATABASE OneTrust0620 ON  ( NAME = OneTrust, FILENAME = 'C:\Snapshots\OneTrust0620.ss' ) 
AS SNAPSHOT OF OneTrust; 
GO 

-- restore snapshot
USE [master]
GO 
DECLARE @kill varchar(8000) = ''; 
SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';' 
FROM sys.dm_exec_sessions
WHERE database_id  = db_id('OneTrust')
EXEC(@kill);
RESTORE DATABASE OneTrust FROM DATABASE_SNAPSHOT = 'OneTrust0620'
use OneTrust

select * from sys.databases