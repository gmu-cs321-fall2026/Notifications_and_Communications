(function ($) {
  "use strict";
  $(function () {
    /* Bootstrap tooltips */
    $('[data-toggle="tooltip"]').tooltip();

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

      /* All */
      if (action === 'all') {
        $checkboxes.prop('checked', true).trigger('change');
      }

      /* None */
      if (action === 'none') {
        $checkboxes.prop('checked', false).trigger('change');
      }

      /* Read */
      if (action === 'read') {
        $checkboxes.prop('checked', false).trigger('change');
        $messages
          .filter('.read')
          .find('input[type="checkbox"]')
          .prop('checked', true)
          .trigger('change');
      }

      /* Unread */
      if (action === 'unread') {
        $checkboxes.prop('checked', false).trigger('change');
        $messages
          .not('.read')
          .find('input[type="checkbox"]')
          .prop('checked', true)
          .trigger('change');
      }

      /* Starred */
      if (action === 'starred') {
        $checkboxes.prop('checked', false).trigger('change');
        $messages
          .find('.glyphicon-star')
          .closest('.list-group-item')
          .find('input[type="checkbox"]')
          .prop('checked', true)
          .trigger('change');
      }

      /* Unstarred */
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

})(jQuery);
