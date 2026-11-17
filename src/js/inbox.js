console.log("inbox.js loaded!");
(function ($) {
"use strict";
$(function () {
console.log("Document ready — starting notification request");

// Existing GET call and response handling remain unchanged.
$.ajax({
  url: "http://localhost:8080/api/notifications",
  method: "GET",
  dataType: "json",

  success: function (notifications) {
    console.log("Notifications received from backend:", notifications);
    notifications.forEach(function (notification) {
      console.log(
        notification.id,
        notification.title,
        notification.message
      );
    });
},

  error: function (xhr, status, error) {
    console.error("Failed to fetch notifications:", error);
    console.error("HTTP status:", xhr.status);
  }
});

// Call this function when the UI or another client needs a templated notification.
window.createTemplatedNotification = function (templateId, params, title) {
  return $.ajax({
    url: "http://localhost:8080/api/notifications/template",
    method: "POST",
    contentType: "application/json",
    dataType: "json",
    data: JSON.stringify({
      templateId: templateId,
      params: params,
      title: title
    }),
    success: function (notification) {
      console.log("Templated notification created:", notification);
    },
    error: function (xhr, status, error) {
      console.error("Failed to create templated notification:", error);
      console.error("HTTP status:", xhr.status);
    }
  });
};

/* Bootstrap tooltips */
$('[data-toggle="tooltip"]').tooltip();

/*
 * Enlarged notification view.
 * Spec: clicking a notification enlarges it to show its title and contents;
 * clicking outside the enlarged notification returns it to normal.
 */

/** Removes the enlarged notification view if one is open. */
function closeNotification() {
  $('.notification-backdrop').remove();
}

/**
 * Shows the given title and message in a larger card over a dimmed backdrop.
 * Clicking the backdrop (outside the card) closes it. .text() is used so
 * notification content can't inject HTML into the page.
 */
function openNotification(title, message) {
  closeNotification();

  var $card = $('<div></div>').css({
    background: '#fff',
    padding: '24px',
    borderRadius: '6px',
    width: '90%',
    maxWidth: '600px',
    maxHeight: '80vh',
    overflowY: 'auto',
    boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)'
  });
    // Title: bold heading with a line underneath to separate it from the contents
  $card.append(
    $('<h3></h3>').css({
      marginTop: 0,
      paddingBottom: '12px',
      marginBottom: '16px',
      borderBottom: '2px solid #ddd',
      fontWeight: 'bold'
    }).text(title)
  );

  // Contents: regular text below the divider, keeping line breaks from the message
  $card.append(
    $('<p></p>').css({
      whiteSpace: 'pre-wrap',
      marginBottom: 0,
      color: '#555'
    }).text(message)
  );

  var $backdrop = $('<div class="notification-backdrop"></div>').css({
    position: 'fixed',
    top: 0, left: 0, right: 0, bottom: 0,
    background: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  });
  $backdrop.append($card);

  // Only a click on the backdrop itself closes it; clicks inside the card do nothing.
  $backdrop.on('click', function (event) {
    if (event.target === this) {
      closeNotification();
    }
  });

  $('body').append($backdrop);
}

/**
 * Opens the enlarged view when a notification row is clicked. Clicks on the
 * checkbox, star, links or buttons inside the row are ignored so they keep
 * working normally. The title and message are read from the row's own HTML.
 */
$(document).on('click', '.tab-pane .list-group-item', function (event) {
  // Ignore clicks on controls inside the row, but not on the row itself
  var $control = $(event.target).closest('input, a, button, .glyphicon-star, .glyphicon-star-empty');
  if ($control.length && !$control.is(this)) {
    return;
  }
  event.preventDefault();

  // Title comes from the row's .message-preview; contents from .message-detail
  var title = $.trim($(this).find('.message-preview').text());
  // Remove the leading "- " that the row HTML puts in front of the contents
  var message = $.trim($(this).find('.message-detail').text()).replace(/^-\s*/, '');
  
  openNotification(title, message);
});

// Adds "Mark as read" and "Mark as unread" buttons to the toolbar
function addMarkButtons() {
  var $group = $('<div class="btn-group" style="margin-left:10px;"></div>');

  // Button: adds the 'read' class to every ticked message
  $('<button type="button" class="btn btn-default btn-sm">Mark as read</button>')
    .on('click', function () {
      $('.tab-pane.active .list-group-item input[type="checkbox"]:checked')
        .closest('.list-group-item')
        .addClass('read');
    })
    .appendTo($group);

  // Button: removes the 'read' class from every ticked message
  $('<button type="button" class="btn btn-default btn-sm">Mark as unread</button>')
    .on('click', function () {
      $('.tab-pane.active .list-group-item input[type="checkbox"]:checked')
        .closest('.list-group-item')
        .removeClass('read');
    })
    .appendTo($group);

  $('.toolbar').first().append($group);
}
addMarkButtons();

/* Individual message checkboxes */
$('.tab-pane .list-group-item input[type="checkbox"]').on('change', function () {
  $(this)
    .closest('.list-group-item')
    .toggleClass('selected', this.checked);
});

/* Master checkbox */
$('.toolbar > .col-sm-9 input[type="checkbox"]').on('change', function () {
  $('.tab-pane.active .list-group-item input[type="checkbox"]')
    .prop('checked', this.checked)
    .trigger('change');
});

/* Selection menu */
$('.toolbar .dropdown-menu a').on('click', function (event) {
  var action = $.trim($(this).text()).toLowerCase();
  if (
    action !== 'all' &&
    action !== 'none' &&
    action !== 'read' &&
    action !== 'unread' &&
    action !== 'starred' &&
    action !== 'unstarred'
  ) {
    return;
  }
  event.preventDefault();
  var $messages = $('.tab-pane.active .list-group-item');
  var $checkboxes = $messages.find('input[type="checkbox"]');

  if (action === 'all') {
    $checkboxes.prop('checked', true).trigger('change');
  }
  if (action === 'none') {
    $checkboxes.prop('checked', false).trigger('change');
  }
  if (action === 'read') {
    $checkboxes.prop('checked', false).trigger('change');
    $messages
      .filter('.read')
      .find('input[type="checkbox"]')
      .prop('checked', true)
      .trigger('change');
  }
  if (action === 'unread') {
    $checkboxes.prop('checked', false).trigger('change');
    $messages
      .not('.read')
      .find('input[type="checkbox"]')
      .prop('checked', true)
      .trigger('change');
  }
  if (action === 'starred') {
    $checkboxes.prop('checked', false).trigger('change');
    $messages
      .find('.glyphicon-star')
      .closest('.list-group-item')
      .find('input[type="checkbox"]')
      .prop('checked', true)
      .trigger('change');
  }
  if (action === 'unstarred') {
    $checkboxes.prop('checked', false).trigger('change');
    $messages
      .find('.glyphicon-star-empty')
      .closest('.list-group-item')
      .find('input[type="checkbox"]')
      .prop('checked', true)
      .trigger('change');
  }
});
/*
 * API template.
 * Both methods must return a jQuery promise so the UI code
 * below keeps working when the stubs become real requests.
 * Replace each stub body with the commented $.ajax call.
 */
var NotificationPreferencesApi = {
  /* TODO: confirm the real endpoint with the backend */
  //url: '/api/users/me/notification-preferences',

  load: function () {
    //TODO: fill in actual response after coordinating with backend and Shared Core to get database API
    //      AI provided commented out code for actual response but removed to avoid dead code
    return $.Deferred().resolve({
      channel: 'in_app',
      frequency: 'immediate',
      events: ['interview_or_application', 'networking_event', 'mentor_request']
    }).promise();
  },

  save: function (preferences) {
    return $.Deferred().resolve(preferences).promise();
  }
};

//link the variable to the input over in HTML, will be used to read later
var $prefsModal = $('#notification-preferences-modal');
var $prefsForm = $('#notification-preferences-form');
var $prefsStatus = $prefsForm.find('[data-role="status"]');
var $prefsSave = $prefsForm.find('[data-role="save"]');


function showPrefsStatus(type, message) {
  $prefsStatus
    .removeClass('hidden alert-info alert-danger')
    .addClass('alert-' + type)
    .text(message);
}

function clearPrefsStatus() {
  $prefsStatus.addClass('hidden').text('');
}

function setPrefsDisabled(disabled) {
  $prefsForm.find('input').add($prefsSave).prop('disabled', disabled);
}

/* Object -> form. .val([..]) checks the inputs whose value is in the array. */
function fillPrefsForm(prefs) {
  $prefsForm.find('input[name="channel"]').val([prefs.channel]);
  $prefsForm.find('input[name="frequency"]').val([prefs.frequency]);
  $prefsForm.find('input[name="events"]').val(prefs.events || []);
}

/* Form -> object (the payload sent to the API) */
function readPrefsForm() {
  return {
    channel: $prefsForm.find('input[name="channel"]:checked').val(),
    frequency: $prefsForm.find('input[name="frequency"]:checked').val(),
    events: $prefsForm
      .find('input[name="events"]:checked')
      .map(function () { return this.value; })
      .get()
  };
}

/* Load the saved preferences every time the modal opens */
$prefsModal.on('show.bs.modal', function () {
  setPrefsDisabled(true);
  showPrefsStatus('info', 'Loading your preferences…');

  NotificationPreferencesApi.load()
    .done(function (prefs) {
      fillPrefsForm(prefs);
      clearPrefsStatus();
      setPrefsDisabled(false);
    })
    .fail(function () {
      /* Leave the form disabled so stale defaults can't overwrite real settings */
      showPrefsStatus('danger', 'We couldn’t load your preferences. Please try again later.');
    });
});

/* Save */
$prefsForm.on('submit', function (event) {
  event.preventDefault();

  var prefs = readPrefsForm();
  
setPrefsDisabled(true);
  $prefsSave.text('Saving…');

  NotificationPreferencesApi.save(prefs)
    .done(function () {
      $prefsModal.modal('hide');
    })
    .fail(function () {
      showPrefsStatus('danger', 'We couldn’t save your preferences. Please try again.');
    })
    .always(function () {
      setPrefsDisabled(false);
      $prefsSave.text('Save preferences');
    });
  });
});
})(jQuery);

/*
const eventSource = new EventSource(
    "http://localhost:8080/api/inbox/stream"
);

// Connection established
eventSource.addEventListener("connected", (event) => {
    console.log(event.data);
});

// New notification
eventSource.addEventListener("notification-added", (event) => {
    const notification = JSON.parse(event.data);

    //[AUGUSTINE NOTE] create something where it would get the new inbox and display that.

    console.log("New notification:", notification);
});

// Notification removed
eventSource.addEventListener("notification-removed", (event) => {
    const data = JSON.parse(event.data);

    console.log("Removed notification:", data.id);
});

// Notification updated
eventSource.addEventListener("notification-updated", (event) => {
    const notification = JSON.parse(event.data);

    console.log("Updated notification:", notification);
});

// Connection errors
eventSource.onerror = (error) => {
    console.error("SSE connection error:", error);
};
*/
