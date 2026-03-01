import Array "mo:core/Array";
import List "mo:core/List";
import Map "mo:core/Map";
import Nat "mo:core/Nat";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Time "mo:core/Time";
import Order "mo:core/Order";
import Float "mo:core/Float";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";

import MixinAuthorization "authorization/MixinAuthorization";
import AccessControl "authorization/access-control";

actor {
  // Types
  public type UserProfile = {
    name : Text;
    role : Text; // "seeker" or "poster"
  };

  public type SeekerProfile = {
    id : Principal;
    name : Text;
    bio : Text;
    skills : [Text];
    qualifications : [Text];
    experience : Text;
    portfolioUrl : Text;
    available : Bool;
  };

  public type PosterProfile = {
    id : Principal;
    name : Text;
    companyName : Text;
    contactInfo : Text;
    verified : Bool;
  };

  public type JobListing = {
    id : Nat;
    title : Text;
    description : Text;
    requiredSkills : [Text];
    location : Text;
    pay : Nat;
    jobType : Text; // "FullTime", "PartTime", "ShortTerm", "Artisan"
    postedBy : Principal;
    timestamp : Int;
    active : Bool;
  };

  public type Application = {
    jobId : Nat;
    seekerId : Principal;
    message : Text;
    status : Text; // "Pending", "Accepted", "Rejected"
  };

  public type Rating = {
    reviewerId : Principal;
    revieweeId : Principal;
    score : Nat;
    comment : Text;
    timestamp : Int;
  };

  public type Analytics = {
    totalSeekers : Nat;
    totalPosters : Nat;
    totalJobs : Nat;
    totalApplications : Nat;
    averageRating : Float;
  };

  public type JobFilter = {
    keyword : ?Text;
    skills : ?[Text];
    location : ?Text;
    minPay : ?Nat;
    maxPay : ?Nat;
    jobType : ?Text;
  };

  // State
  let userProfiles = Map.empty<Principal, UserProfile>();
  let seekerProfiles = Map.empty<Principal, SeekerProfile>();
  let posterProfiles = Map.empty<Principal, PosterProfile>();
  let jobListings = Map.empty<Nat, JobListing>();
  let applications = Map.empty<Nat, List.List<Application>>();
  let ratings = Map.empty<Principal, List.List<Rating>>();

  var jobCounter = 0;

  // Mixin authorization
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ─── Required UserProfile functions ───────────────────────────────────────

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ─── Seeker Profile ────────────────────────────────────────────────────────

  public shared ({ caller }) func createSeekerProfile(
    name : Text,
    bio : Text,
    skills : [Text],
    qualifications : [Text],
    experience : Text,
    portfolioUrl : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can create seeker profiles");
    };
    let profile : SeekerProfile = {
      id = caller;
      name;
      bio;
      skills;
      qualifications;
      experience;
      portfolioUrl;
      available = true;
    };
    seekerProfiles.add(caller, profile);
    userProfiles.add(caller, { name; role = "seeker" });
  };

  public shared ({ caller }) func updateSeekerAvailability(available : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can update their availability");
    };
    switch (seekerProfiles.get(caller)) {
      case (null) { Runtime.trap("Seeker profile not found") };
      case (?profile) {
        seekerProfiles.add(caller, { profile with available });
      };
    };
  };

  public query func getSeekerProfile(id : Principal) : async ?SeekerProfile {
    seekerProfiles.get(id);
  };

  // ─── Poster Profile ────────────────────────────────────────────────────────

  public shared ({ caller }) func createPosterProfile(
    name : Text,
    companyName : Text,
    contactInfo : Text,
  ) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can create poster profiles");
    };
    let profile : PosterProfile = {
      id = caller;
      name;
      companyName;
      contactInfo;
      verified = false;
    };
    posterProfiles.add(caller, profile);
    userProfiles.add(caller, { name; role = "poster" });
  };

  public query func getPosterProfile(id : Principal) : async ?PosterProfile {
    posterProfiles.get(id);
  };

  // ─── Job Listings ──────────────────────────────────────────────────────────

  public shared ({ caller }) func createJobListing(
    title : Text,
    description : Text,
    requiredSkills : [Text],
    location : Text,
    pay : Nat,
    jobType : Text,
  ) : async Nat {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can create job listings");
    };
    jobCounter += 1;
    let job : JobListing = {
      id = jobCounter;
      title;
      description;
      requiredSkills;
      location;
      pay;
      jobType;
      postedBy = caller;
      timestamp = Time.now();
      active = true;
    };
    jobListings.add(jobCounter, job);
    jobCounter;
  };

  public query func getJobListing(id : Nat) : async ?JobListing {
    jobListings.get(id);
  };

  public shared ({ caller }) func updateJobListingStatus(jobId : Nat, active : Bool) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can update job listings");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        if (listing.postedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job poster or an admin can update this listing");
        };
        let updated = { listing with active };
        jobListings.add(jobId, updated);
      };
    };
  };

  public query func searchJobs(filter : JobFilter) : async [JobListing] {
    let allListings = jobListings.values().toArray();
    allListings.filter(func(job) {
      if (not job.active) { return false };
      var matches = true;
      switch (filter.keyword) {
        case (null) { () };
        case (?keyword) {
          matches := matches and (job.title.contains(#text keyword) or job.description.contains(#text keyword));
        };
      };
      switch (filter.skills) {
        case (null) { () };
        case (?skills) {
          let hasSkill = skills.filter(func(s) {
            job.requiredSkills.any(func(reqSkill) { Text.equal(reqSkill, s) });
          }).size() > 0;
          matches := matches and hasSkill;
        };
      };
      switch (filter.location) {
        case (null) { () };
        case (?loc) {
          matches := matches and job.location.contains(#text loc);
        };
      };
      switch (filter.minPay) {
        case (null) { () };
        case (?minPay) {
          matches := matches and job.pay >= minPay;
        };
      };
      switch (filter.maxPay) {
        case (null) { () };
        case (?maxPay) {
          matches := matches and job.pay <= maxPay;
        };
      };
      switch (filter.jobType) {
        case (null) { () };
        case (?jt) {
          matches := matches and Text.equal(job.jobType, jt);
        };
      };
      matches;
    });
  };

  // Only the seeker themselves or an admin can request matched jobs for a seeker
  public query ({ caller }) func getMatchedJobsForSeeker(seekerId : Principal) : async [JobListing] {
    if (caller != seekerId and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only get matched jobs for yourself");
    };
    let seeker = switch (seekerProfiles.get(seekerId)) {
      case (null) { Runtime.trap("Seeker profile not found") };
      case (?profile) { profile };
    };

    let allListings = jobListings.values().toArray();
    let activeListings = allListings.filter(func(job) { job.active });

    let scoredListings = activeListings.map(
      func(job) {
        var score = 0 : Nat;
        for (skill in seeker.skills.values()) {
          for (req in job.requiredSkills.values()) {
            if (Text.equal(skill, req)) { score += 1 };
          };
        };
        (job, score);
      }
    );

    let sorted = scoredListings.sort(
      func(a, b) { Nat.compare(b.1, a.1) }
    );

    sorted.map<(JobListing, Nat), JobListing>(func(pair) { pair.0 });
  };

  // ─── Applications ──────────────────────────────────────────────────────────

  public shared ({ caller }) func applyToJob(jobId : Nat, message : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can apply for jobs");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        if (not listing.active) { Runtime.trap("Job listing is not active") };
        let newApplication : Application = {
          jobId;
          seekerId = caller;
          message;
          status = "Pending";
        };
        let existingApps = switch (applications.get(jobId)) {
          case (null) { List.empty<Application>() };
          case (?lst) { lst };
        };
        existingApps.add(newApplication);
        applications.add(jobId, existingApps);
      };
    };
  };

  // Only the job poster or admin can update application status
  public shared ({ caller }) func updateApplicationStatus(jobId : Nat, seekerId : Principal, newStatus : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can update application status");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        if (listing.postedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job poster or an admin can update application status");
        };
        switch (applications.get(jobId)) {
          case (null) { Runtime.trap("No applications found for this job") };
          case (?appList) {
            let updated = appList.map<Application, Application>(
              func(app) {
                if (Principal.equal(app.seekerId, seekerId)) {
                  { app with status = newStatus };
                } else {
                  app;
                };
              }
            );
            applications.add(jobId, updated);
          };
        };
      };
    };
  };

  // Job poster can view applications for their own jobs; seekers can view their own applications; admins can view all
  public query ({ caller }) func getApplicationsForJob(jobId : Nat) : async [Application] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can view applications");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        if (listing.postedBy != caller and not AccessControl.isAdmin(accessControlState, caller)) {
          Runtime.trap("Unauthorized: Only the job poster or an admin can view all applications");
        };
        switch (applications.get(jobId)) {
          case (null) { [] };
          case (?appList) { appList.toArray() };
        };
      };
    };
  };

  // Seekers can view their own applications
  public query ({ caller }) func getMyApplications() : async [Application] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can view their applications");
    };
    let allApps = applications.values().toArray();
    let myApps = allApps.foldLeft<List.List<Application>, [Application]>(
      [],
      func(acc : [Application], appList : List.List<Application>) {
        let filtered = appList.toArray().filter(
          func(app) { Principal.equal(app.seekerId, caller) }
        );
        acc.concat(filtered);
      },
    );
    myApps;
  };

  // ─── Ratings ───────────────────────────────────────────────────────────────

  public shared ({ caller }) func submitRating(revieweeId : Principal, score : Nat, comment : Text) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Only authenticated users can submit ratings");
    };
    if (score < 1 or score > 5) {
      Runtime.trap("Score must be between 1 and 5");
    };
    if (Principal.equal(caller, revieweeId)) {
      Runtime.trap("Cannot rate yourself");
    };

    let newRating : Rating = {
      reviewerId = caller;
      revieweeId;
      score;
      comment;
      timestamp = Time.now();
    };

    let existingRatings = switch (ratings.get(revieweeId)) {
      case (null) { List.empty<Rating>() };
      case (?lst) { lst };
    };
    existingRatings.add(newRating);
    ratings.add(revieweeId, existingRatings);
  };

  public query func getRatingsForUser(userId : Principal) : async [Rating] {
    switch (ratings.get(userId)) {
      case (null) { [] };
      case (?lst) { lst.toArray() };
    };
  };

  public query func getAverageRatingForUser(userId : Principal) : async Float {
    switch (ratings.get(userId)) {
      case (null) { 0.0 };
      case (?lst) {
        let arr = lst.toArray();
        if (arr.size() == 0) { return 0.0 };
        var total = 0 : Nat;
        for (r in arr.values()) { total += r.score };
        total.toFloat() / arr.size().toFloat();
      };
    };
  };

  // ─── Admin API ─────────────────────────────────────────────────────────────

  public query ({ caller }) func adminListSeekers() : async [SeekerProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all seekers");
    };
    seekerProfiles.values().toArray();
  };

  public query ({ caller }) func adminListPosters() : async [PosterProfile] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all posters");
    };
    posterProfiles.values().toArray();
  };

  public query ({ caller }) func adminListJobListings() : async [JobListing] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can list all job listings");
    };
    jobListings.values().toArray();
  };

  public shared ({ caller }) func adminApproveJobListing(jobId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can approve job listings");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        jobListings.add(jobId, { listing with active = true });
      };
    };
  };

  public shared ({ caller }) func adminRemoveJobListing(jobId : Nat) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can remove job listings");
    };
    switch (jobListings.get(jobId)) {
      case (null) { Runtime.trap("Job not found") };
      case (?listing) {
        jobListings.add(jobId, { listing with active = false });
      };
    };
  };

  public shared ({ caller }) func adminVerifyPoster(posterId : Principal) : async () {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can verify posters");
    };
    switch (posterProfiles.get(posterId)) {
      case (null) { Runtime.trap("Poster profile not found") };
      case (?profile) {
        posterProfiles.add(posterId, { profile with verified = true });
      };
    };
  };

  public query ({ caller }) func adminGetAnalytics() : async Analytics {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view analytics");
    };

    let totalSeekers = seekerProfiles.size();
    let totalPosters = posterProfiles.size();
    let totalJobs = jobListings.size();

    var totalApplications = 0 : Nat;
    for (appList in applications.values()) {
      totalApplications += appList.size();
    };

    var totalRatingScore = 0 : Nat;
    var totalRatingCount = 0 : Nat;
    for (ratingList in ratings.values()) {
      for (r in ratingList.values()) {
        totalRatingScore += r.score;
        totalRatingCount += 1;
      };
    };

    let averageRating : Float = if (totalRatingCount == 0) {
      0.0;
    } else {
      totalRatingScore.toFloat() / totalRatingCount.toFloat();
    };

    {
      totalSeekers;
      totalPosters;
      totalJobs;
      totalApplications;
      averageRating;
    };
  };
};
