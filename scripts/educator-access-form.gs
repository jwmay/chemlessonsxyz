/**
 * chemlessons.xyz — Educator Access Request form builder (Google Apps Script)
 *
 * Generates the educator-access Google Form from scratch. Run it at
 * https://script.google.com while signed in as the site account
 * (chemlessons.xyz@gmail.com): paste this file into a new project, run
 * buildEducatorAccessForm(), authorize, then copy the published URL from the
 * Execution log (View > Logs) into SITE.requestAccessUrl in js/data.js.
 *
 * The form branches on "Which best describes you?":
 *   - school-based educators  -> school-email + staff-directory section
 *   - homeschool / independent -> welcoming "describe your homeschool" section
 *
 * ⚠️  Running this creates a NEW form + responses sheet with a NEW URL. The live
 * form is already published and wired into the site, so use this only to
 * rebuild from scratch — to tweak the existing form, edit it in the Forms
 * editor instead (re-running would orphan the current responder link).
 */
function buildEducatorAccessForm() {
  // ---- Create the form ----
  var form = FormApp.create("chemlessons.xyz -- Educator Access Request");
  form.setDescription(
    "Assessments (quizzes, unit tests, and answer keys) are shared privately with " +
    "verified educators so the answer keys don't end up posted publicly. Tell me a little " +
    "about yourself and I'll verify you, then share a Google Drive folder to your account.\n\n" +
    "Questions? Email hello@chemlessons.xyz."
  );
  form.setConfirmationMessage(
    "Thanks! Your request is in. I'll verify you (usually within a few days) and share " +
    "the assessment folder to the email you gave me. -- chemlessons.xyz"
  );
  form.setProgressBar(true);
  form.setAllowResponseEdits(false);

  // ---- Page 0: common questions + the branch ----
  form.addTextItem().setTitle("Your name").setRequired(true);

  form.addCheckboxItem()
    .setTitle("Which course(s) do you plan to use?")
    .setChoiceValues(["Conceptual Chemistry", "Mathematical Chemistry"])
    .setRequired(false);

  // Optional Chem Cash invite-interest opt-in. Lives on page 0 (not a branch
  // section) so every respondent sees it regardless of how they're verified.
  var chemCash = form.addCheckboxItem()
    .setTitle("Interested in Chem Cash?")
    .setHelpText("Chem Cash is my classroom points-economy app -- students earn points for their " +
                 "work and spend them on a class store, a live stock market, classroom jobs, and " +
                 "chemistry games (chem.cash/about). It's invite-only while it grows.")
    .setRequired(false);
  chemCash.setChoices([
    chemCash.createChoice("Yes -- send me an invite when spots open.")
  ]);

  // The branching question must be the LAST item on the page; choices are wired up below.
  var role = form.addMultipleChoiceItem()
    .setTitle("Which best describes you?")
    .setRequired(true);

  // ---- Section A: school-based educators ----
  var schoolPage = form.addPageBreakItem()
    .setTitle("A few details")
    .setHelpText("So I can match you to your school and verify quickly.");

  var schoolEmail = form.addTextItem()
    .setTitle("School email address")
    .setHelpText("Use your school or district email if you have one -- it makes verification fast.")
    .setRequired(true);
  schoolEmail.setValidation(
    FormApp.createTextValidation().setHelpText("Please enter a valid email address.")
      .requireTextIsEmail().build()
  );

  form.addTextItem().setTitle("School or district name").setRequired(true);

  form.addTextItem()
    .setTitle("Link to your school staff page or directory")
    .setHelpText("A public page that lists you as staff -- this is how I verify school educators. " +
                 "No staff page? Leave it blank and add a note below.")
    .setRequired(false);

  form.addParagraphTextItem().setTitle("Anything else I should know?").setRequired(false);

  var schoolAgree = form.addCheckboxItem()
    .setTitle("Educator agreement")
    .setHelpText("Use these however helps your classroom, including sharing answer keys with your students to check their work. The only ask: don't post them anywhere public.")
    .setRequired(true);
  schoolAgree.setChoices([
    schoolAgree.createChoice("I agree -- I won't post these assessments or answer keys publicly or share them beyond my own classroom.")
  ]);

  // ---- Section B: homeschool / independent educators (welcoming) ----
  var homeschoolPage = form.addPageBreakItem()
    .setTitle("Tell me about your homeschool")
    .setHelpText("No school email needed -- a quick description is all I use to verify you.");

  var hsEmail = form.addTextItem()
    .setTitle("Your email address")
    .setHelpText("Where I'll share the assessment folder.")
    .setRequired(true);
  hsEmail.setValidation(
    FormApp.createTextValidation().setHelpText("Please enter a valid email address.")
      .requireTextIsEmail().build()
  );

  form.addParagraphTextItem()
    .setTitle("Tell me a bit about your homeschool")
    .setHelpText("A sentence or two is perfect -- e.g. how long you've homeschooled, the grade/subjects " +
                 "you teach, and why the assessments would help. This is the main thing I use to verify homeschoolers.")
    .setRequired(true);

  form.addTextItem()
    .setTitle("Co-op, association (e.g. HSLDA), umbrella/charter program, or registration")
    .setHelpText("Optional -- a name or link here speeds verification up, but it is not required. Leave blank if none apply.")
    .setRequired(false);

  var hsAgree = form.addCheckboxItem()
    .setTitle("Parent / educator agreement")
    .setHelpText("Use these however helps your homeschool, including using answer keys with your student(s). The only ask: don't post them anywhere public.")
    .setRequired(true);
  hsAgree.setChoices([
    hsAgree.createChoice("I agree -- I won't post these assessments or answer keys publicly or otherwise redistribute them.")
  ]);

  // ---- Wire up branching ----
  // After a school respondent finishes Section A, submit (don't fall through into Section B).
  homeschoolPage.setGoToPage(FormApp.PageNavigationType.SUBMIT);

  role.setChoices([
    role.createChoice("Chemistry teacher", schoolPage),
    role.createChoice("Other science teacher", schoolPage),
    role.createChoice("Instructional coach / curriculum lead", schoolPage),
    role.createChoice("Homeschool parent", homeschoolPage),
    role.createChoice("Independent tutor", homeschoolPage),
    role.createChoice("Other", homeschoolPage)
  ]);

  // ---- Linked responses spreadsheet ----
  var ss = SpreadsheetApp.create("chemlessons.xyz -- Educator Access (responses)");
  form.setDestination(FormApp.DestinationType.SPREADSHEET, ss.getId());

  // ---- URLs (open View > Logs / the Execution log) ----
  Logger.log("PUBLISHED (responder link): " + form.getPublishedUrl());
  Logger.log("Short link: " + form.shortenFormUrl(form.getPublishedUrl()));
  Logger.log("Edit the form: " + form.getEditUrl());
  Logger.log("Responses sheet: " + ss.getUrl());
}
