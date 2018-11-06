<#

.SYNOPSIS
This is the Recreo deployment script for Cloud Based Applications

.DESCRIPTION
The script will deploy your application to the machine that it runs on. You are able to deploy the types ["web" | "service"]
and these will setup your application.

When deploying a WebSite the IIS app pool will be created with the same name as the web site with all sites assumed to be using SSL

.EXAMPLE
./deploy.ps1 -type web -zipFile c:\test\sample.web.zip -deployFolder c:\test\sample.web -name sample.web -sslCertificate sample.ssl -url sample.web.com

.NOTES

type           - required - The type of application to be deployed [web|service]
zipFile        - required - The location of the zip that will be deployed
deployFolder   - required - The location of the folder that the application will be deployed to
name           - required - The name of the website in iis
url            - required - The url that the web site will be deployed to
sslCertificate - optional - The name of the SSL certificate to use
memoryLimitPct - optional - The percentage of physical memory that can be used before recycling the app pool
logsDirectory  - optional - the directory all logs will be placed in, default is C:\logs
username       - optional - the domain account that will be used to set the identity on the app pool
password       - optional - the password for the domain account, this is a secure string
serviceAccount - optional - The service account to use as the identity of the app pool
retryLimit     - optional - The number of times a deploy should retry if it fails
binaryFilePath - optional - The file path to the binary to start as a Windows Service  
#>

Param(
    [Parameter(Mandatory=$True)]
    [ValidateSet("web", "service", "configure_webserver")]
    [string] $type,

    [Parameter(Mandatory=$False)]
    [ValidateScript({Test-Path $_})]
    [string] $zipFile,

    [Parameter(Mandatory=$False)]
    [ValidateNotNullOrEmpty()]
    [string] $deployFolder,

    [Parameter(Mandatory=$False)]
    [ValidateNotNullOrEmpty()]
    [string] $name,

    [Parameter(Mandatory=$False)]
    [ValidateNotNullOrEmpty()]
    [string] $url,

    [Parameter(Mandatory=$False)]
    [ValidateNotNullOrEmpty()]
    [string] $sslCertificate = $NULL,

    [Parameter(Mandatory=$False)]
    [ValidateNotNullOrEmpty()]
    [string] $logsDirectory = "C:\Logs",

    [Parameter(Mandatory=$False)]
    [ValidateRange(1, 100)]
    [int] $memoryLimitPct = 0,

    [Parameter(Mandatory=$False)]
    [string] $username = $NULL,

    [Parameter(Mandatory=$False)]
    [SecureString] $password = $NULL,

    [Parameter(Mandatory=$False)]
    [string] $serviceAccount = $NULL,

    [Parameter(Mandatory=$False)]
    [ValidatePattern("[0-9]{3,5}")]
    [int] $port = 0,

    [Parameter(Mandatory=$False)]
    [String]
    $certificateLocation = $NULL,

    [Parameter(Mandatory=$False)]
    [SecureString]
    $certificatePassword = $NULL,

    [Parameter(Mandatory=$False)]
    [String]
    $binaryFilePath = $NULL,

    [Parameter(Mandatory=$False)]
    [ValidateRange(1, 10)]
    [int] $retryLimit = 3

)

import-module WebAdministration

$logFile = $NULL
Function CreateLogFile {
    Param(
        [string] $appName,
        [string] $logsDirectory
    )
    $logFolder = "$logsDirectory\Deployment\$appName"
    if(!(Test-Path $logFolder)) {
        New-Item -ItemType directory -Path $logFolder -Force
    }

    $date = (Get-Date).toString("yyyyMMdd-HHmmss")
    $script:logFile = "$logFolder\$date.log"
    if (!(Test-Path $logFile)) {
        New-Item -ItemType file -Path $logFile -Force
    }

    WriteLog -level INFO -message "Deployment logs for $appName will be written to $logFile"
}

Function WriteLog {
    Param(
        [Parameter(Mandatory=$False)]
        [ValidateSet("DEBUG","INFO","WARN","ERROR")]
        [string] $level = "INFO",

        [string] $message
    )

    $timeStamp = (Get-Date).toString("yyyy/MM/dd HH:mm:ss:fff")
    $logMessage = "$timeStamp - $level - $message"

    Add-Content $logFile -value $logMessage

    $textColour = switch($level) {
        "DEBUG" { "Green" }
        "INFO" { "Yellow" }
        "WARN" { "Blue" }
        "ERROR" { "Red"}
    }
    Write-Host $logMessage -ForegroundColor $textColour
}

function ImportCertificate($location, [SecureString] $password) {
    if ($NULL -ne $location -and "" -ne $certificateLocation) {
        WriteLog -level DEBUG -message "Installing new certificate at location $location"
        Import-PfxCertificate -FilePath $location -Password $password -CertStoreLocation Cert:\LocalMachine\My
        WriteLog -level INFO -message "Installed new Certificate $location into 'My' Store"
    }
}

Function CreateDeployFolder {
    Param(
        [string] $name,

        [Parameter(Mandatory=$False)]
        [string] $deployFolderPath = "C:\recreo\apps\$name"
    )

    if(Test-Path $deployFolderPath) {
        WriteLog -level INFO -message "The folder $deployFolderPath already exists"
    }
    else {
        WriteLog -level DEBUG -message "Creating deploy folder $deployFolderPath"
        New-Item -ItemType directory -Path $deployFolderPath -Force
        WriteLog -level INFO -message "Created folder $deployFolderPath"
    }

    if (Test-Path "$deployFolderPath\*") {
        # CHANGE - delete the folder contents for idempotent deploys
        WriteLog -level WARN -message "The deployment folder $deployFolderPath is not empty"
        Remove-Item -Path "$deployFolderPath\*" -Recurse -Force
        WriteLog -Level WARN -message "The deployment folder $deployFolderPath has been cleared of previous files"
    }

    return $deployFolderPath
}

Function ExtractDeployZip {
    Param(
        [string] $deployZipFile,
        [string] $deployFolderPath
    )

    # extract the Zip file
    if(!(Test-Path $deployZipFile)) {
        WriteLog -level ERROR -message "Deployment ZIP $deployZipFile not found"
        throw  "Deployment ZIP $deployZipFile not found"
    }

    WriteLog -level DEBUG -message "Extracting ZIP $deployZipFile"
    Expand-Archive $deployZipFile -DestinationPath $deployFolderPath
}

Function GetPhysicalMemory {
    return (Get-WMIObject -class Win32_ComputerSystem | ForEach-Object {($_.TotalPhysicalMemory)})
}

Function CreateAppPool {
    Param(
        [PSObject] $Parameters
    )

    if(Test-Path "IIS:\AppPools\$($Parameters.Name)") {
        WriteLog -level INFO -message "The App Pool$($Parameters.Name) already exists"
        $appPool = Get-Item "IIS:\AppPools\$($Parameters.Name)"
    } else {
        $appPool = New-WebAppPool -Name $Parameters.Name
    }

    WriteLog -level DEBUG -message "Enabling 32 bit applications in IIS"
    $appPool.enable32BitAppOnWin64 = 1

    WriteLog -level DEBUG -message "Turning off the periodic restart timer in IIS"
    $appPool.recycling.periodicRestart.time = "0.00:00:00"
    if (0 -ne $Parameters.MemoryLimitPct) {
        $allocatedmem = [Math]::Round(($(GetPhysicalMemory) * ($Parameters.MemoryLimitPct / 100)) / 1MB, 0)
        WriteLog -level INFO -message "Creating the app pool to recycle at $allocatedmem MB"
        $appPool.recycling.periodicRestart.memory = [int]$allocatedmem
        $appPool.recycling.periodicRestart.privateMemory = [int]$allocatedmem
    }

    if ($NULL -ne $Parameters.ServiceAccount) {
        WriteLog -level INFO -message "Setting app pool service account to service account <$($Parameters.ServiceAccount)>"
        $appPool.processModel.identityType = $Parameters.ServiceAccount
    }

   if (($NULL -ne $Parameters.UserName) -AND ($NULL -ne $Parameters.Password)) {
       WriteLog -level INFO -message "Setting app pool service account to user $Parameters.UserName"
       $appPool.processModel.userName = $Parameters.UserName
       $appPool.processModel.password = $Parameters.Password
       $appPool.processModel.identityType = 3
   }

    $appPool | Set-Item

    WriteLog -level INFO -message "Created App Pool $name"
}

Function CreateWebBinding {
    Param(
        [string] $name,
        [string] $url
    )

    # TODO : find out if we use a CA in prod, changes SslFlag to 3 if so
    $binding = Get-WebBinding -Name $name -Protocol "https"
    if ($NULL -eq $binding) {
        $binding = New-WebBinding -Name $name `
                       -Protocol https `
                       -IPAddress * `
                       -HostHeader $url `
                       -Port 443 `
                       -SslFlags 0
        WriteLog -level INFO -message "Created new HTTPS bindings for website $name"
    } else {
        WriteLog -level INFO -message "HTTPS binding on $name already exists"
    }

    return $binding
}

Function GetSslCertificateThumbprint {
    Param(
        [string] $sslCertificate
    )

    # TODO : verify certs are not in an CA
    $thumbprint = Get-ChildItem -Path Cert:\LocalMachine\My | Where-Object {$_.subject -like "*"+$sslCertificate+"*"} | Select-Object -ExpandProperty Thumbprint
    return $thumbprint
}

Function SetWebSiteLogging {
    Param(
        [string] $name,
        [string] $logFolder
    )

    $iisLogsDirectory = "$logFolder\IIS\$name"

    if(Test-Path $iisLogsDirectory) {
        WriteLog -level INFO -message "The folder $iisLogsDirectory already exists"
    }
    else {
        WriteLog -level DEBUG -message "setting up IIS Logging to '$iisLogsDirectory'"
        New-Item -ItemType directory -Path $iisLogsDirectory -Force
        WriteLog -level INFO -message "Created Log folder $iisLogsDirectory"
    }

    if (!(Test-Path "IIS:\Sites\$name")) {
        WriteLog -level ERROR -message "Unable to set log file location, web site $name not found"
        return
    }

    WriteLog -level DEBUG -message "Setting website $name log path"
    $webSite = Get-Item "IIS:\Sites\$name"
    $webSite.logFile.directory = $iisLogsDirectory
    $webSite.traceFailedRequestsLogging.directory = $iisLogsDirectory
    $webSite | Set-Item
    WriteLog -level INFO -message "Set website $name log path to be $iisLogsDirectory"

    return $iisLogsDirectory
}

Function SetIisFolderPermissions {
    Param(
        [string[]] $paths,
        [string] $user
    )

    $userItem = Get-LocalUser -Name $user -ErrorAction 'silentlycontinue'
    if ($NULL -eq $userItem) {
        WriteLog -level WARN -message "Unable to find user $user"
        return
    }

    Foreach ($path in $paths) {
        $acl = Get-Acl $path
        $rule = New-Object system.security.accesscontrol.filesystemaccessrule($user,"FullControl", "ContainerInherit,ObjectInherit", "None", "Allow")
        $acl.SetAccessRule($rule)
        Set-Acl $path $acl
    }
}

Function CreateWebsite {
    Param(
        [PSObject] $Parameters
    )

    If((Test-Path "IIS:\Sites\$name")){
        WriteLog -level INFO -message "The website $name already exists"
    } else {
        New-Website -Name $Parameters.Name -PhysicalPath $Parameters.DeployFolder -ApplicationPool $Parameters.Name -HostHeader $Parameters.Url -Ssl -Port 443 -SslFlags 0 | Out-Null
        WriteLog -level INFO -message "Created website $($Parameters.Name)"
    }

    $Parameters.IisLogFolder = SetWebSiteLogging -name $Parameters.Name -logFolder $Parameters.LogFolder
    foreach ($user in @("IIS AppPool\$($Parameters.Name)", "IIS_IUSRS", "Users")) {
        WriteLog -level DEBUG -message "Setting folder permissions for user $user"
        SetIisFolderPermissions -user $user -paths @($Parameters.DeployFolder,$Parameters.LogFolder)
    }

    $thumbprint = $(GetSslCertificateThumbprint -sslCertificate $Parameters.SslCertificate)

    # TODO : find out if we use a CA in prod, change location from my to cert store name
    $(CreateWebBinding -name $Parameters.Name -url $Parameters.Url).AddSslCertificate($thumbprint, "my")
    WriteLog -level INFO -message "Added SSL certificate to bindings for website $($Parameters.Name)"
}

Function CreateWindowsService {
    Param(
        [PSObject] $Parameters
    )

    if ($NULL -ne (Get-Service -name $name)) {
        New-Service -Name $Parameters.Name -BinaryPathName $Parameters.BinaryPath
        WriteLog -message "Created Windows Service $($Parameters.Name)"
    } else {
        WriteLog -message "Windows Service $($Parameters.Name) already exists"
    }
}

Function SetupIisFeatures {
    Set-ExecutionPolicy Bypass -Scope Process

    WriteLog -level DEBUG -message "Begin setting up the IIS Windows Feature"

    $iisFeatures = @(
        "IIS-WebServerRole",
        "IIS-WebServer",
        "IIS-CommonHttpFeatures",
        "IIS-HttpErrors",
        "IIS-HttpRedirect",
        "IIS-HealthAndDiagnostics",
        "IIS-HttpLogging",
        "IIS-LoggingLibraries",
        "IIS-RequestMonitor",
        "IIS-HttpTracing",
        "IIS-Security",
        "IIS-RequestFiltering",
        "IIS-Performance",
       "IIS-WebServerManagementTools",
        "IIS-IIS6ManagementCompatibility",
        "IIS-Metabase",
        "IIS-ManagementConsole",
        "IIS-BasicAuthentication",
        "IIS-WindowsAuthentication",
        "IIS-StaticContent",
        "IIS-DefaultDocument",
        "IIS-ApplicationInit",
        "IIS-ASPNET45",
        "IIS-ISAPIExtensions",
        "IIS-ISAPIFilter",
        "IIS-HttpCompressionStatic",
        "IIS-NetFxExtensibility45",
        "Web-Mgmt-Service"
    )

    foreach($feature in $iisFeatures) {
        if ((Get-WindowsOptionalFeature -Online -FeatureName $feature).State -eq "Disabled"){
            WriteLog -level INFO -message "$($feature) missing - installing"
            $result = Enable-WindowsOptionalFeature -Online -FeatureName $feature -All
            if ($?) {
                WriteLog -level ERROR -message $result
            }
         }
    }
    WriteLog -level INFO -message "Completed setting up the IIS Windows Feature"
}

Function InstallChocolatey {
    WriteLog -level DEBUG -message "Begin Installing Chocolatey"
    Set-ExecutionPolicy Bypass -Scope Process -Force; iex ((New-Object System.Net.WebClient).DownloadString('https://chocolatey.org/install.ps1'))
    choco config set cacheLocation c:\temp\choco
    WriteLog -level INFO -message "Completed Installing Chocolatey"
}

Function CreateChocoPackage($packageName, $version) {
    WriteLog -level DEBUG -message "creating chocopackage $packageName"
    $package = New-Object -TypeName PSObject
    $package | Add-Member -MemberType NoteProperty -Name PackageName -Value $packageName
    $package | Add-Member -MemberType NoteProperty -Name Version -Value $version

    return $package
}

Function ConfigureWebServer {
    Param(
        [PSObject] $Parameters
    )

    SetupIisFeatures
    InstallChocolatey

    $packages = ( `
        (CreateChocoPackage "AppFabric" "1.1"), `
        (CreateChocoPackage "webdeploy" "3.6"), `
        (CreateChocoPackage "urlrewrite" "2.1.20171010") `
    )

    ForEach ($package in $packages) {
        WriteLog -level DEBUG -message "Installing choco package $($package.PackageName)"
        choco install $package.PackageName --version $package.Version -y
    }
}

Function DeployWebSite {
    Param(
        [PSObject] $Parameters
    )

    $deployFolderPath = ConfigureWebServer -Parameters $Parameters

    ##Deployment
    WriteLog -level DEBUG -message "Creating the WebSite deploy folder"
    $Parameters.DeployFolder = CreateDeployFolder -deployFolderPath $Parameters.DeployFolder -name $Parameters.Name

    if ($NULL -ne $deployZipFile) {
        WriteLog -level DEBUG -message "Extracting the deployment archive to $($Parameters.DeployFolder)"
        ExtractDeployZip -deployFolderPath $Parameters.DeployFolder -deployZipFile $Parameters.ZipFile
    }

    # create the app pool
    WriteLog -level DEBUG -message "Creating the Website App Pool"
    CreateAppPool -Parameters $Parameters

    # create the website if it does not exist
    ## - set the iis settings
    WriteLog -level DEBUG -message "Creating the Website within IIS"
    CreateWebsite -Parameters $Parameters

    # Stop the WebSite
    WriteLog -level INFO -message "Stopping the website"
    Stop-Website -Name $Parameters.Name

    # reset the working directory to the new deploy directory
    $physicalPath = Get-ItemProperty "IIS:\Sites\$($Parameters.Name)" -Name physicalPath
    if ($physicalPath -ne $deployFolderPath) {
        WriteLog -level INFO -message "Setting the Deploy directory for the WebSite"
        Set-ItemProperty "IIS:\Sites\$($Parameters.Name)" -Name physicalPath -Value $Parameters.DeployFolder
    }

    # Start the Web Site
    WriteLog -level INFO -message "Restarting the website"
    Start-Website -Name $Parameters.Name
}

Function DeployService {
    Param(
        [PSObject] $Parameters
    )

    # stop the service
    WriteLog -level DEBUG -message "Stopping service $($Parameters.Name)"
    Stop-Service -Name $Parameters.Name

    # deploy zip package
    WriteLog -level DEBUG -message "Creating the Service deploy folder"
    $Parameters.DeployFolder = CreateDeployFolder -deployFolderPath $Parameters.DeployFolder -name $Parameters.Name

    WriteLog -level DEBUG -message "Extracting the deployment archive to $deployFolderPath"
    ExtractDeployZip -deployFolderPath $Parameters.DeployFolder -deployZipFile $Parameters.ZipFile

    # create the windows service
    WriteLog -level DEBUG -message "Creating Windows Service $($Parameters.Name)"
    CreateWindowsService -name $Parameters.Name -deployFolderPath $Parameters.DeployFolder

    # restart the service
    WriteLog -level DEBUG -message "Starting service $($Parameters.Name)"
    Start-Service -Name $Parameters.Name
}

Function CreateDeployParams {
    WriteLog -level DEBUG -message "creating deployment package parameters"
    $package = New-Object -TypeName PSObject

    $package | Add-Member -MemberType NoteProperty -Name Name -Value $script:name
    $package | Add-Member -MemberType NoteProperty -Name ZipFile -Value $script:zipFile
    $package | Add-Member -MemberType NoteProperty -Name DeployFolder -Value $script:deployFolder
    $package | Add-Member -MemberType NoteProperty -Name Url -Value $script:url
    $package | Add-Member -MemberType NoteProperty -Name SslCertificate -Value $script:sslCertificate
    $package | Add-Member -MemberType NoteProperty -Name Port -Value $script:port
    $package | Add-Member -MemberType NoteProperty -Name ServiceAccount -Value $script:serviceAccount
    $package | Add-Member -MemberType NoteProperty -Name UserName -Value $script:username
    $package | Add-Member -MemberType NoteProperty -Name Password -Value $script:password
    $package | Add-Member -MemberType NoteProperty -Name MemoryLimitPct -Value $script:memoryLimitPct
    $package | Add-Member -MemberType NoteProperty -Name BinaryPath -Value $script:binaryFilePath
    $package | Add-Member -MemberType NoteProperty -Name LogFolder -Value $script:logsDirectory
    $package | Add-Member -MemberType NoteProperty -Name IisLogFolder -Value $NULL

    return $package
}

$ErrorActionPreference = "Stop"
# create the log file
CreateLogFile -appName $name
$success = $False
$count = 0

do {
    Try {

        if ($NULL -ne $certificateLocation) {
            ImportCertificate -location $certificateLocation -password $certificatePassword
        }
        $deployParams = CreateDeployParams

        switch ($type) {
            "web" {
                SetupIisFeatures
                DeployWebSite -Parameters $deployParams 
            }
           "service" { DeployService -Parameters $deployParams }
            "configure_webserver" {
                ConfigureWebServer -Parameters $deployParams
            }
        }
        $success = $True
    } Catch {
        $count = $count + 1
        WriteLog -level ERROR -message $_
        WriteLog -level ERROR -message "Deploy Failed, next attempt in 5 seconds"
        Start-Sleep -seconds 5
    }
} Until (($count -eq $retryLimit) -OR ($success -eq $True))

