import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Principal "mo:core/Principal";
import List "mo:core/List";
import Text "mo:core/Text";

module {
  type OldJobType = Text;

  type OldJobListing = {
    id : Nat;
    title : Text;
    description : Text;
    requiredSkills : [Text];
    location : Text;
    pay : Nat;
    jobType : OldJobType;
    postedBy : Principal;
    timestamp : Int;
    active : Bool;
  };

  type OldActor = {
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    seekerProfiles : Map.Map<Principal, { id : Principal; name : Text; bio : Text; skills : [Text]; qualifications : [Text]; experience : Text; portfolioUrl : Text; available : Bool }>;
    posterProfiles : Map.Map<Principal, { id : Principal; name : Text; companyName : Text; contactInfo : Text; verified : Bool }>;
    jobListings : Map.Map<Nat, OldJobListing>;
    applications : Map.Map<Nat, List.List<{ jobId : Nat; seekerId : Principal; message : Text; status : Text }>>;
    ratings : Map.Map<Principal, List.List<{ reviewerId : Principal; revieweeId : Principal; score : Nat; comment : Text; timestamp : Int }>>;
    jobCounter : Nat;
  };

  type NewJobType = {
    #fullTime;
    #partTime;
    #shortTerm;
    #artisan;
    #nysc;
  };

  type NewJobListing = {
    id : Nat;
    title : Text;
    description : Text;
    requiredSkills : [Text];
    location : Text;
    pay : Nat;
    jobType : NewJobType;
    postedBy : Principal;
    timestamp : Int;
    active : Bool;
  };

  type NewActor = {
    userProfiles : Map.Map<Principal, { name : Text; role : Text }>;
    seekerProfiles : Map.Map<Principal, { id : Principal; name : Text; bio : Text; skills : [Text]; qualifications : [Text]; experience : Text; portfolioUrl : Text; available : Bool }>;
    posterProfiles : Map.Map<Principal, { id : Principal; name : Text; companyName : Text; contactInfo : Text; verified : Bool }>;
    jobListings : Map.Map<Nat, NewJobListing>;
    applications : Map.Map<Nat, List.List<{ jobId : Nat; seekerId : Principal; message : Text; status : Text }>>;
    ratings : Map.Map<Principal, List.List<{ reviewerId : Principal; revieweeId : Principal; score : Nat; comment : Text; timestamp : Int }>>;
    jobCounter : Nat;
  };

  func textToJobType(text : Text) : NewJobType {
    if (Text.equal(text, "fullTime")) { return #fullTime };
    if (Text.equal(text, "partTime")) { return #partTime };
    if (Text.equal(text, "shortTerm")) { return #shortTerm };
    if (Text.equal(text, "artisan")) { return #artisan };
    if (Text.equal(text, "youthCorps")) { return #nysc };
    #fullTime;
  };

  public func run(old : OldActor) : NewActor {
    let newJobListings = old.jobListings.map<Nat, OldJobListing, NewJobListing>(
      func(_id, job) {
        { job with jobType = textToJobType(job.jobType) };
      }
    );
    { old with jobListings = newJobListings };
  };
};
