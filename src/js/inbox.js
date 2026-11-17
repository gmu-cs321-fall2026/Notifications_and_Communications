console.log("inbox.js loaded!");

(function ($) {
    "use strict";

    const INBOX_API = "http://localhost:8080/api/inbox";

    let inboxEventSource = null;
    let showFilteredInbox = false;

    // Preferences modal elements
    const $prefsModal = $("#notification-preferences-modal");
    const $prefsForm = $("#notification-preferences-form");
    const $prefsStatus = $prefsForm.find('[data-role="status"]');
    const $prefsSave = $prefsForm.find('[data-role="save"]');

    /*
     * All backend requests live here so the rest of the UI uses
     * the same API routes.
     */
    const InboxApi = {
        getAll: function () {
            return $.ajax({
                url: INBOX_API + "/notifications",
                method: "GET",
                dataType: "json"
            });
        },

        getFiltered: function () {
            return $.ajax({
                url: INBOX_API + "/notifications/filtered",
                method: "GET",
                dataType: "json"
            });
        },

        getPreferences: function () {
            return $.ajax({
                url: INBOX_API + "/preferences",
                method: "GET",
                dataType: "json"
            });
        },

        savePreferences: function (preferences) {
            return $.ajax({
                url: INBOX_API + "/preferences",
                method: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(preferences)
            });
        },

        add: function (notification) {
            return $.ajax({
                url: INBOX_API + "/notifications",
                method: "POST",
                contentType: "application/json",
                dataType: "json",
                data: JSON.stringify(notification)
            });
        },

        markRead: function (id, read) {
            return $.ajax({
                url: INBOX_API + "/notifications/" +
                    encodeURIComponent(id) + "/read",
                method: "PUT",
                data: { read: read }
            });
        },

        pin: function (id) {
            return $.ajax({
                url: INBOX_API + "/notifications/" +
                    encodeURIComponent(id) + "/pin",
                method: "PUT"
            });
        },

        unpin: function (id) {
            return $.ajax({
                url: INBOX_API + "/notifications/" +
                    encodeURIComponent(id) + "/unpin",
                method: "PUT"
            });
        },

        remove: function (id) {
            return $.ajax({
                url: INBOX_API + "/notifications/" +
                    encodeURIComponent(id),
                method: "DELETE"
            });
        }
    };

    /*
     * The backend NotificationPref class uses boolean category flags.
     * The modal's event choices are mapped to those flags below.
     *
     * This mapping assumes NotificationPref has:
     * application, mentor, events, core, and interview properties.
     */
    const NotificationPreferencesApi = {
        load: function () {
            return InboxApi.getPreferences().then(function (pref) {
                const events = [];

                if (pref.application || pref.interview) {
                    events.push("interview_or_application");
                }

                if (pref.events) {
                    events.push("networking_event");
                }

                if (pref.mentor) {
                    events.push("mentor_request");
                }

                return {
                    channel: "in_app",
                    frequency: "immediate",
                    events: events
                };
            });
        },

        save: function (preferences) {
            const selectedEvents = preferences.events || [];

            const backendPreferences = {
                application: selectedEvents.indexOf(
                    "interview_or_application"
                ) !== -1,

                interview: selectedEvents.indexOf(
                    "interview_or_application"
                ) !== -1,

                events: selectedEvents.indexOf(
                    "networking_event"
                ) !== -1,

                mentor: selectedEvents.indexOf(
                    "mentor_request"
                ) !== -1,

                core: false
            };

            return InboxApi.savePreferences(backendPreferences);
        }
    };

    /* Escape backend-provided text before inserting it into HTML. */
    function escapeHtml(value) {
        return $("<div>")
            .text(value == null ? "" : String(value))
            .html();
    }

    /*
     * Render notifications returned by the backend.
     * The list is rebuilt on refresh, so backend state remains authoritative.
     */
    function renderInbox(notifications) {
        const $list = $("#home .list-group");

        $list.empty();

        if (!notifications || notifications.length === 0) {
            $list.append(
                '<div class="list-group-item empty-state">' +
                "Your inbox is empty." +
                "</div>"
            );
            updateUnreadBadge(0);
            return;
        }

        let unreadCount = 0;

        notifications.forEach(function (notification) {
            if (!notification.read) {
                unreadCount++;
            }

            const id = escapeHtml(notification.id);
            const title = escapeHtml(notification.title);
            const message = escapeHtml(notification.message);
            const type = escapeHtml(notification.notificationType);
            const createdAt = notification.createdAt
                ? escapeHtml(new Date(notification.createdAt).toLocaleString())
                : "";

            const readClass = notification.read ? "read" : "";
            const starClass = notification.pinned
                ? "glyphicon-star"
                : "glyphicon-star-empty";

            const pinLabel = notification.pinned
                ? "Unpin notification"
                : "Pin notification";

            const html =
                '<div class="list-group-item ' + readClass + '" ' +
                    'data-id="' + id + '">' +

                    '<div class="checkbox">' +
                        '<label>' +
                            '<input type="checkbox" ' +
                                'aria-label="Select notification">' +
                        '</label>' +
                    '</div>' +

                    '<button type="button" ' +
                        'class="notification-pin btn btn-link" ' +
                        'aria-label="' + pinLabel + '" ' +
                        'title="' + pinLabel + '">' +
                        '<span class="glyphicon ' + starClass + '"></span>' +
                    '</button>' +

                    '<span class="name label label-info">' +
                        type +
                    '</span>' +

                    '<span class="message-preview">' +
                        title +
                    '</span>' +

                    '<span class="message-detail">' +
                        ' - ' + message +
                    '</span>' +

                    '<span class="badge message-time">' +
                        createdAt +
                    '</span>' +

                    '<button type="button" ' +
                        'class="notification-delete btn btn-link" ' +
                        'aria-label="Delete notification" ' +
                        'title="Delete notification">' +
                        '<span class="glyphicon glyphicon-trash"></span>' +
                    '</button>' +

                '</div>';

            $list.append(html);
        });

        updateUnreadBadge(unreadCount);
    }

    function updateUnreadBadge(count) {
        // The sidebar badge in the supplied HTML is the Inbox count badge.
        $(".sidebar .nav-pills li.active .badge").text(count);
    }

    /*
     * Load either all notifications or the preference-filtered notifications.
     * The current view is retained when SSE triggers a refresh.
     */
    function loadInbox(filtered) {
        if (typeof filtered === "boolean") {
            showFilteredInbox = filtered;
        }

        const request = showFilteredInbox
            ? InboxApi.getFiltered()
            : InboxApi.getAll();

        return request.done(function (notifications) {
            renderInbox(notifications);
        }).fail(function (xhr) {
            console.error(
                "Unable to load inbox. HTTP status:",
                xhr.status
            );
        });
    }

    function getSelectedNotificationIds() {
        return $("#home .list-group-item")
            .has('input[type="checkbox"]:checked')
            .map(function () {
                return $(this).attr("data-id");
            })
            .get();
    }

    function runForSelectedNotifications(read) {
        const selectedIds = getSelectedNotificationIds();

        if (selectedIds.length === 0) {
            return;
        }

        const requests = selectedIds.map(function (id) {
            return InboxApi.markRead(id, read);
        });

        $.when.apply($, requests)
            .done(function () {
                loadInbox();
            })
            .fail(function (xhr) {
                console.error(
                    "Unable to update selected notifications:",
                    xhr.status
                );
                loadInbox();
            });
    }

    function addMarkButtons() {
        const $toolbar = $(".toolbar").first();

        if ($toolbar.length === 0 ||
            $toolbar.find(".mark-read, .mark-unread").length > 0) {
            return;
        }

        const $group = $(
            '<div class="btn-group" style="margin-left:10px;"></div>'
        );

        $("<button>", {
            type: "button",
            class: "btn btn-default btn-sm mark-read",
            text: "Mark as read"
        }).appendTo($group);

        $("<button>", {
            type: "button",
            class: "btn btn-default btn-sm mark-unread",
            text: "Mark as unread"
        }).appendTo($group);

        $toolbar.find(".col-sm-9, .col-md-10").first().append($group);
    }

    /*
     * Connect to the backend's Server-Sent Events stream.
     * The backend should broadcast:
     * notification-added, notification-updated,
     * notification-removed, and inbox-cleared (if implemented).
     */
    function connectInboxStream() {
        if (inboxEventSource) {
            inboxEventSource.close();
        }

        inboxEventSource = new EventSource(INBOX_API + "/stream");

        inboxEventSource.addEventListener("connected", function (event) {
            console.log("Inbox SSE connected:", event.data);
            loadInbox();
        });

        inboxEventSource.addEventListener(
            "notification-added",
            function (event) {
                console.log(
                    "Notification added:",
                    JSON.parse(event.data)
                );
                loadInbox();
            }
        );

        inboxEventSource.addEventListener(
            "notification-updated",
            function (event) {
                console.log(
                    "Notification updated:",
                    JSON.parse(event.data)
                );
                loadInbox();
            }
        );

        inboxEventSource.addEventListener(
            "notification-removed",
            function (event) {
                console.log(
                    "Notification removed:",
                    JSON.parse(event.data)
                );
                loadInbox();
            }
        );

        inboxEventSource.addEventListener(
            "inbox-cleared",
            function () {
                // Handles a clear event sent by the backend or another client.
                loadInbox();
            }
        );

        inboxEventSource.onerror = function (error) {
            console.error("Inbox SSE connection error:", error);
            // EventSource automatically attempts to reconnect.
        };

        return inboxEventSource;
    }
        function showPrefsStatus(type, message) {
        $prefsStatus
            .removeClass("hidden alert-info alert-danger alert-success")
            .addClass("alert-" + type)
            .text(message);
    }

    function clearPrefsStatus() {
        $prefsStatus.addClass("hidden").text("");
    }

    function setPrefsDisabled(disabled) {
        $prefsForm.find("input").add($prefsSave).prop("disabled", disabled);
    }

    function fillPrefsForm(preferences) {
        $prefsForm.find('input[name="channel"]')
            .val([preferences.channel || "in_app"]);

        $prefsForm.find('input[name="frequency"]')
            .val([preferences.frequency || "immediate"]);

        $prefsForm.find('input[name="events"]')
            .val(preferences.events || []);
    }

    function readPrefsForm() {
        return {
            channel: $prefsForm
                .find('input[name="channel"]:checked')
                .val(),

            frequency: $prefsForm
                .find('input[name="frequency"]:checked')
                .val(),

            events: $prefsForm
                .find('input[name="events"]:checked')
                .map(function () {
                    return this.value;
                })
                .get()
        };
    }

    function initializePreferences() {
        $prefsModal.on("show.bs.modal", function () {
            setPrefsDisabled(true);
            showPrefsStatus("info", "Loading your preferences…");

            NotificationPreferencesApi.load()
                .done(function (preferences) {
                    fillPrefsForm(preferences);
                    clearPrefsStatus();
                    setPrefsDisabled(false);
                })
                .fail(function (xhr) {
                    console.error(
                        "Unable to load preferences:",
                        xhr.status
                    );

                    showPrefsStatus(
                        "danger",
                        "We couldn’t load your preferences. Please try again later."
                    );
                });
        });

        $prefsForm.on("submit", function (event) {
            event.preventDefault();

            const preferences = readPrefsForm();

            setPrefsDisabled(true);
            $prefsSave.text("Saving…");

            NotificationPreferencesApi.save(preferences)
                .done(function () {
                    $prefsModal.modal("hide");
                    loadInbox(true);
                })
                .fail(function (xhr) {
                    console.error(
                        "Unable to save preferences:",
                        xhr.status
                    );

                    showPrefsStatus(
                        "danger",
                        "We couldn’t save your preferences. Please try again."
                    );
                })
                .always(function () {
                    setPrefsDisabled(false);
                    $prefsSave.text("Save preferences");
                });
        });
    }

    /*
     * Public function for other frontend scripts to add notifications.
     * Example:
     * window.addInboxNotification(
     *   "New Mentor Request",
     *   "You have a new mentor matching request.",
     *   "Mentor"
     * );
     */
    window.addInboxNotification = function (
        title,
        message,
        notificationType
    ) {
        return InboxApi.add({
            title: title,
            message: message,
            notificationType: notificationType
        }).done(function (notification) {
            console.log("Notification created:", notification);
            loadInbox();
        }).fail(function (xhr) {
            console.error(
                "Unable to add notification:",
                xhr.status,
                xhr.responseText
            );
        });
    };

    /*
     * Optional public function for refreshing the inbox from other scripts.
     * Pass true to show the preference-filtered view.
     */
    window.loadInbox = loadInbox;
        $(function () {
        console.log("Document ready — connecting inbox to backend.");

        // Bootstrap tooltips
        if ($.fn.tooltip) {
            $('[data-toggle="tooltip"]').tooltip();
        }

        // Add read/unread toolbar buttons
        addMarkButtons();

        // Read/unread selected notifications
        $(".toolbar").on("click", ".mark-read", function () {
            runForSelectedNotifications(true);
        });

        $(".toolbar").on("click", ".mark-unread", function () {
            runForSelectedNotifications(false);
        });

        // Individual notification selection (delegated for dynamic rows)
        $("#home").on(
            "change",
            '.list-group-item input[type="checkbox"]',
            function () {
                $(this)
                    .closest(".list-group-item")
                    .toggleClass("selected", this.checked);
            }
        );

        // Master checkbox
        $(".toolbar").on(
            "change",
            'input[type="checkbox"]',
            function () {
                $("#home .list-group-item input[type='checkbox']")
                    .prop("checked", this.checked)
                    .trigger("change");
            }
        );

        // Selection menu: All, None, Read, Unread, Starred, Unstarred
        $(".toolbar .dropdown-menu").on("click", "a", function (event) {
            const action = $.trim($(this).text()).toLowerCase();

            const supportedActions = [
                "all",
                "none",
                "read",
                "unread",
                "starred",
                "unstarred"
            ];

            if (supportedActions.indexOf(action) === -1) {
                return;
            }

            event.preventDefault();

            const $messages = $("#home .list-group-item");
            const $checkboxes = $messages.find('input[type="checkbox"]');

            $checkboxes.prop("checked", false).trigger("change");

            let $targets = $();

            if (action === "all") {
                $targets = $messages;
            } else if (action === "read") {
                $targets = $messages.filter(".read");
            } else if (action === "unread") {
                $targets = $messages.not(".read");
            } else if (action === "starred") {
                $targets = $messages.has(".glyphicon-star");
            } else if (action === "unstarred") {
                $targets = $messages.has(".glyphicon-star-empty");
            }

            if (action !== "none") {
                $targets
                    .find('input[type="checkbox"]')
                    .prop("checked", true)
                    .trigger("change");
            }
        });

        // Mark every notification as read from the More menu
        $(".toolbar").on("click", ".mark-all-read", function (event) {
            event.preventDefault();

            const ids = $("#home .list-group-item").map(function () {
                return $(this).attr("data-id");
            }).get();

            const requests = ids.map(function (id) {
                return InboxApi.markRead(id, true);
            });

            if (requests.length) {
                $.when.apply($, requests)
                    .done(function () {
                        loadInbox();
                    })
                    .fail(function (xhr) {
                        console.error(
                            "Unable to mark all notifications read:",
                            xhr.status
                        );
                        loadInbox();
                    });
            }
        });

        // Pin/unpin notification
        $("#home").on("click", ".notification-pin", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const $item = $(this).closest(".list-group-item");
            const id = $item.attr("data-id");

            const currentlyPinned = $(this)
                .find(".glyphicon")
                .hasClass("glyphicon-star");

            const request = currentlyPinned
                ? InboxApi.unpin(id)
                : InboxApi.pin(id);

            request.done(function () {
                loadInbox();
            }).fail(function (xhr) {
                console.error("Unable to change pin status:", xhr.status);
            });
        });

        // Delete an individual notification
        $("#home").on("click", ".notification-delete", function (event) {
            event.preventDefault();
            event.stopPropagation();

            const id = $(this)
                .closest(".list-group-item")
                .attr("data-id");

            InboxApi.remove(id)
                .done(function () {
                    loadInbox();
                })
                .fail(function (xhr) {
                    console.error(
                        "Unable to delete notification:",
                        xhr.status
                    );
                });
        });

        // Refresh button
        $(".toolbar").on(
            "click",
            '[aria-label="Refresh inbox"]',
            function () {
                loadInbox();
            }
        );

        // Preferences modal
        initializePreferences();

        // Initial inbox load and live updates
        loadInbox();
        connectInboxStream();
    });

})(jQuery);
