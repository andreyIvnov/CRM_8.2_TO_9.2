(function (el_interfaces_history) {
    var commons;

    el_interfaces_history.onLoad = function (executionContext) {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_interfaces_history.onLoadEvents();
            el_interfaces_history.onChangeEvents();
        } catch (error) {
            commons.PageErrorHandler(error, "el_interfaces_history.onLoad()");
        }
    }

    el_interfaces_history.onLoadEvents = function () {

    }

    el_interfaces_history.onChangeEvents = function () {

    }

    el_interfaces_history.displayIconTooltipForStatus = function (rowData, userLCID) {
        var str = JSON.parse(rowData);
        var coldata = str.el_l_status_Value;
        var imgName = "";
        var tooltip = "";
        switch (parseInt(coldata, 10)) {
            case 1:
                imgName = "el_green_circle_16X16.png";
                tooltip = "";
                break;

            case 2:
                imgName = "el_red_circle_16X16.png";
                tooltip = "";
                break;

            default:
                imgName = "";
                tooltip = "";
                break;
        }
        var resultarray = [imgName, tooltip];
        return resultarray;
    }

})(window.el_interfaces_history = window.el_interfaces_history || {});