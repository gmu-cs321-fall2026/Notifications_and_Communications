"use strict";

/**
 * The email list displayed in the inbox.
 *
 * Each email has:
 * - title: The large, bold heading.
 * - body: The normal email text.
 */
const emails = [];

/**
 * Adds an email to the inbox.
 *
 * @param {string} title - The email's title.
 * @param {string} body - The email's text body.
 */
function addEmail(title, body) {
    if (typeof title !== "string" || typeof body !== "string") {
        throw new TypeError("Email title and body must both be strings.");
    }

    emails.push({
        title,
        body
    });

    renderInbox();
}

/**
 * Displays all emails in the inbox.
 */
function renderInbox() {
    const emailList = document.getElementById("email-list");
    const emailCount = document.getElementById("email-count");

    // Clear the current inbox display.
    emailList.replaceChildren();

    if (emails.length === 0) {
        const emptyMessage = document.createElement("p");

        emptyMessage.className = "empty-inbox";
        emptyMessage.textContent = "Your inbox is empty.";

        emailList.appendChild(emptyMessage);
    } else {
        for (const email of emails) {
            const emailElement = createEmailElement(
                email.title,
                email.body
            );

            emailList.appendChild(emailElement);
        }
    }

    updateEmailCount(emailCount);
}

/**
 * Creates the HTML element representing one email.
 *
 * @param {string} title
 * @param {string} body
 * @returns {HTMLElement}
 */
function createEmailElement(title, body) {
    const article = document.createElement("article");
    article.className = "email";

    const heading = document.createElement("h2");
    heading.className = "email-title";
    heading.textContent = title;

    const paragraph = document.createElement("p");
    paragraph.className = "email-body";
    paragraph.textContent = body;

    article.appendChild(heading);
    article.appendChild(paragraph);

    return article;
}

/**
 * Updates the number displayed in the inbox header.
 *
 * @param {HTMLElement} element
 */
function updateEmailCount(element) {
    const count = emails.length;

    element.textContent =
        count === 1
            ? "1 email"
            : `${count} emails`;
}


// ------------------------------------------------------------
// Example emails
// ------------------------------------------------------------

addEmail(
    "Welcome to your inbox",
    "This is your first email. The inbox will automatically grow as more emails are added."
);

addEmail(
    "Your account has been updated",
    "Your account information was successfully updated. No further action is required."
);

addEmail(
    "Meeting reminder",
    "This is a reminder that your meeting is scheduled for tomorrow at 10:00 AM."
);


// ------------------------------------------------------------
// The addEmail() function is available globally.
//
// You can add another email from the browser console:
//
// addEmail(
//     "A new email",
//     "This email was added using JavaScript."
// );
// ------------------------------------------------------------
