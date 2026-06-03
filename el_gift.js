(function (el_gift) {
    var commons;
    var Enums = {
        FormType: {
            Create: 1,
        },
    };

    el_gift.onLoad = function () {
        try {
            debugger;
            commons = new elad_commons();
            commons.SetFormContext(executionContext.getFormContext());

            el_gift.onLoadEvents();
            el_gift.onChangeEvents();
            el_gift.onSaveActions();
        } catch (err) {
            commons.PageErrorHandler(err, "el_gift.onLoad()");
        }
    }

    el_gift.onLoadEvents = function () {
        el_gift.enableCodeField();
    };

    el_gift.onChangeEvents = function () {
        commons.AddOnChange('el_n_starting_stock', el_gift.onStartingStockCountChamged);
    };

    el_gift.onSaveActions = function () {

    }

    el_gift.onStartingStockCountChamged = function () {
        if (commons.GetFieldValue('el_n_starting_stock'))
            commons.SetFieldValue('el_dt_last_starting_stock_count_update', new Date());
        else
            commons.SetFieldValue('el_dt_last_starting_stock_count_update', null);
    }

    el_gift.enableCodeField = function () {
        if (commons.GetFormType() == Enums.FormType.Create)
            commons.SetDisabled('el_s_code', false);
    }

})((window.el_gift = window.el_gift || {}));