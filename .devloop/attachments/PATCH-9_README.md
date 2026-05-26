# Patch

Patch is a support experience where a user can sign up or log in and continue getting help from the same page after login.

## Main Experience

After login, the navigation bar should show:

- on the left side: the Patch logo and the Patch name
- on the right side: `Welcome, <username>`, `Incidents`, and `Logout`

When the user clicks the Patch logo or Patch name, it should redirect to the home page.

On the same page, the user should see:

- device tiles such as `VDI`, `Printer`, and similar issue types
- a document upload option under each tile
- a chat prompt at the bottom of the page

The document upload under each tile should work even before the user starts a conversation. The user should not be forced to click a tile or send a first message before uploading documents.

The number of uploaded documents under a tile can be `N`.

## Upload And PDF Flow

When the user uploads a PDF under a tile:

1. the system should accept the upload without requiring a chat to start first
2. the system should extract the text from the PDF immediately
3. the extracted text should be saved in the DB
4. the saved record should not have an empty extracted text when the PDF contains readable text

The uploaded document data stored in the DB should include the document details and the extracted text so it can be used later during chat.

## Chat And Incident Flow

The whole system should work as follows:

1. the user signs up or logs in
2. the user can upload documents under a tile
3. the user can click a tile or type directly in the chat prompt
4. after the first user message, the system should create an incident with an incident ID
5. when the user asks a question, the system should determine which saved PDF content is related to that issue
6. the system should retrieve the saved text from the DB
7. the LLM should use that text to answer the user’s question
8. the conversation should be saved on the incident page
9. if the user continues later from the incident page, the LLM should have the context of the previous messages

For AI, we use Ollama, and the model is `gemma4:31b-cloud`.

The system should store:

- user details
- uploaded document information
- extracted PDF text
- incident details
- conversation history
- resolution details

## Incident Page

From the incident page, the user should be able to see:

- the full conversation between the user and the Patch agent
- the incident timeline
- the assigned incident details
- the current resolution state
- who resolved the issue

The timeline should clearly show whether the incident is:

- opened
- in progress
- escalated
- resolved

The assigned incident details should include:

- incident ID
- priority
- urgency
- impact
- incident status

If the incident is already resolved, the user should not be able to type anything in the chat prompt.

If the incident is not resolved, the user should be able to continue the chat from the incident page.

## Escalation And Resolution

If the Patch agent is not able to solve the issue, the issue should be escalated.

Once the issue is escalated, the system should update the incident details such as:

- priority
- urgency
- impact
- incident status

If the issue is resolved, the system should ask for:

- review
- feedback

The system should save in the DB:

- whether the issue was resolved
- how it was resolved
- whether it was resolved by the Patch agent
- whether it was resolved manually
- who resolved it

## UI And UX Expectations

The UI and UX should be clear, clean, and user-friendly.

The experience should feel simple for the user:

- easy to understand
- easy to navigate
- clear in showing upload, chat, incident status, and next steps
- consistent between the home page, chat flow, and incident page
