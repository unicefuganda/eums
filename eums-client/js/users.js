$(document).ready(function () {
    groupRolesBootstrap();
});

function hideElements(elements) {
    for (var index = 0; index < elements.length; ++index) {
        $(elements[index]).hide();
    }
}

function showElements(elements) {
    for (var index = 0; index < elements.length; ++index) {
        $(elements[index]).show();
    }
}

function resetElementValue(elements) {
    for (var index = 0; index < elements.length; ++index) {
        $(elements[index]).val('');
    }
}

function addRequiredValidationRule(elements) {
    for (var index = 0; index < elements.length; ++index) {
        if ($(elements[index]).length <= 0)
            continue;
        $(elements[index]).rules("add", {required: true});
    }
}

function disableFields(selector) {
    $('body').find(selector).prop('disabled', true);
}

function enableFields(selector) {
    $('body').find(selector).removeProp('disabled');
}

function groupRolesBootstrap() {
    var $consignee_element = $('#create-user-form #id_consignee');

    hideElements([$consignee_element.parent().parent()]);

    $('select.select-roles').on('change', function () {
        var $selected_role = $.trim($(this).find('option:selected').text());
        if ($selected_role.indexOf("Implementing Partner") != -1) {
            showElements([$consignee_element.parent().parent()]);
            enableFields('#id_consignee');
        } else {
            disableFields('#create-user-form #id_consignee');
            hideElements([$consignee_element.parent().parent()]);
            resetElementValue([$consignee_element]);
        }
    });
}