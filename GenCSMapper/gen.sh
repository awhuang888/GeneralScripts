# node GenScripts.js -m "TestDomainOne.Employee TestDomainTwo.Manager"
# node GenScripts.js -m "RecreoDomain.AddressDetail MigrationApiModel.CreateAddressDetails"
# node GenScripts.js -m "MineExtractModel.AddressDetailsExtract MigrationApiModel.CreateAddressDetails"
# node GenScripts.js -m "MineExtractModel.DocumentExtract MigrationApiModel.CreateDocument"
# node GenScripts.js -m "RecreoDomain.Artefact MigrationApiModel.CreateDocument"
# postpone node GenScripts.js -m "RecreoDomain.ArtefactIndex MigrationApiModel.CreateDocument"
# node GenScripts.js -m "MineExtractModel.SignificantLifeEventExtract RecreoDomain.SignificantEvent" # test readiness
# node GenScripts.js -m "RecreoDomain.SignificantEvent MigrationApiModel.CreateSignificantEvent"
  node GenScripts.js -m "MineExtractModel.SignificantLifeEventExtract MigrationApiModel.CreateSignificantEvent"

dotnet run --project './GenCSMapper/GenCSMapper.csproj'
