
    using System;
    namespace GenCSMapper
{
        public class SignificantLifeEventExtract
    {
        public string MemberExternalReference { get; set; }

        public int SignificantEventTypeId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }
    }


        public class CreateSignificantEvent
    {
        public string MemberExternalReference { get; set; }

        public int SignificantEventTypeId { get; set; }

        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        public int LegalEntityId { get; set; }

        public int CreatedByLegalEntityId { get; set; }
    }

}
    