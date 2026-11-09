console.log("inbox.js loaded!");
(function ($) {
  "use strict";
  $(function () {
    console.log("Document ready — starting notification request");
    
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

    /* Bootstrap tooltips */
    $('[data-toggle="tooltip"]').tooltip();
    
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
})(jQuery);