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
  })(jQuery);
  