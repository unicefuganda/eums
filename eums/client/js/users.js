$(document).ready(function () {
    groupRolesBootstrap();
});

function hideElements(elements) {
    for (var  index = 0; index < elements.length; ++index) {
        $(elements[index]).hide();
    }
}

function showElements(elements) {
    for (var  index = 0; index < elements.length; ++index) {
        $(elements[index]).show();
    }
}

function resetElementValue(elements) {
    for (var  index = 0; index < elements.length; ++index) {
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

function groupRolesBootstrap() {
    var $consignee_element = $('#create-user-form #id_consignee');

    hideElements([$consignee_element.parent().parent()]);

    $('input.radio-roles').on('change', function () {
        var $selected_role = $.trim($(this).parents('label').text());
        if ($selected_role === "Implementing Partner") {
            showElements([$consignee_element.parent().parent()]);
        } else {
            disableFields('#create-user-form #id_consignee');
            hideElements([$consignee_element.parent().parent()]);
            resetElementValue([$consignee_element]);
        }
    });
}