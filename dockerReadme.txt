

#following initiate a SqlServer docker
docker run -d --name sql2 -e ACCEPT_EULA='Y' -e SA_PASSWORD='P@ssw0rd01' -e MSSQL_PID='Express' -e TZ='Australia/Sydney' -p 1432:1433 mcr.microsoft.com/mssql/server
docker run -d --name sql3 -e ACCEPT_EULA='Y' -e SA_PASSWORD='P@ssw0rd01' -e TZ='Australia/Sydney' -p 1431:1433 mcr.microsoft.com/mssql/server
docker run -d --name sql5 -e ACCEPT_EULA='Y' -e SA_PASSWORD='Allan@1234' -e TZ='Australia/Sydney' -p 1430:1433 mcr.microsoft.com/mssql/server

#Following failed - need strong password
docker run -d --name sql5 -e ACCEPT_EULA='Y' -e SA_PASSWORD='allan123' -e TZ='Australia/Sydney' -p 1430:1433 mcr.microsoft.com/mssql/server

#Check current containers
docker ps -a

#Connect to the docker
docker exec -it sql5 "bash"

#Connect to Sql Server within container
/opt/mssql-tools/bin/sqlcmd -S localhost -U SA -P 'Allan@1234'
#test sql as Following
1>use master
2>go
1>select * from sysobjects
2>go


#To Connect Sql Server outside the Container
sqlcmd -S localhost,1430 -U SA -P "Allan@1234"