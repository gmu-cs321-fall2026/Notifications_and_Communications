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
  });
})(jQuery);
