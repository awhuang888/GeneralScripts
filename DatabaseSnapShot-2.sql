-- create snapshot
CREATE DATABASE AllanTest0620 ON  ( NAME = AllanTest, FILENAME = 'C:\Snapshots\AllanTest0620.ss' ) 
AS SNAPSHOT OF AllanTest; 
GO 

-- restore snapshot
USE [master]
GO 
DECLARE @kill varchar(8000) = ''; 
SELECT @kill = @kill + 'kill ' + CONVERT(varchar(5), session_id) + ';' 
FROM sys.dm_exec_sessions
WHERE database_id  = db_id('AllanTest')
EXEC(@kill);
RESTORE DATABASE AllanTest FROM DATABASE_SNAPSHOT = 'AllanTest0620'
use AllanTest

select * from sys.databases