﻿/// <reference path="MKWebAPI.js" />
/// <reference path="ModelGeneration.js" />


/**
* MSCRM 2016 Model Kit for JavaScript
* @author Mihir M. Kadam
* @current version : 1.0

* Credits:
*   The idea of this library was inspired by Jaimie Ji XrmServiceToolkit.
*   Additional thanks to all contributors of MSCRM and i have learned a lot from you all.
* Date: 31 July, 2016
*
* Special Thanks:
*   Somesh Siripuram (Sr.Developer at CloudFronts)
* Date: July, 2016

* What's new:
**********************************************************************************************************
*   Version: 1.0
*   Date: July, 2016
*       New Function - callBacks
*       New Function - fetchAllData
*       New Function - errorHandler
*       New Function - fethEntityMetadata
*       New Function - fethEntityMetadataCallBack
**********************************************************************************************************
*/


var BL = function () {

};

BL.MG = function () {
    var callBacks = { Success: null, Error: errorHandler };
    var fetchAllData = function (successCallback, errorCallback) {
        /// <summary>
        /// This function will retrieve project, project task and project task codes
        /// </summary>
        /// <param name="SuccessCallback" type="function">Success Call back function reference</param>
        /// <param name="ErrorCallback" type="function">Error Call back function reference</param>
        "use strict";

        callBacks.Success = successCallback;
        callBacks.Error = errorCallback;
        fetchEntityMetadata();
    };
    var fetchEntityMetadata = function () {
        "use strict";
        MK.WebAPI.Retrieve("EntityDefinitions", null, "$select=DisplayName", null, fetchEntityMetadataCallBack, errorHandler, null, null, null, true);

    };
    var fetchEntityMetadataCallBack = function (result) {
        "use strict";
        if (result.value.length === 0) {
            callBacks.Error(new Error("Model Kit: Does not have access to system/custom entity. Please contact System Administrator."));
            return;
        }
        callBacks.Success(result);
    };
    var fetchAttributeMetadata = function (entityId, successCallback, errorCallback) {
        "use strict";
        cleadGlobalData();

        callBacks.Success = successCallback;
        callBacks.Error = errorCallback;
        MK.WebAPI.Retrieve("EntityDefinitions", entityId, "$select=LogicalName,ObjectTypeCode&$expand=Attributes($select=LogicalName,AttributeType,IsLogical,Description,DisplayName,IsValidForAdvancedFind)", null, fetchAttributeMetadataCallBack, errorHandler, null, null, null, true);
    };
    var fetchAttributeMetadataCallBack = function (result) {
        "use strict";
        if (!result) {
            callBacks.Error(new Error("Model Kit: Does not have access to system/custom entity attributes. Please contact System Administrator."));
            return;
        }
        modelGeneration.data.attributeMetadata = result;
        fetchFormMetadata();
    };
    var fetchFormMetadata = function () {
        "use strict";

        var objectTypeCode = modelGeneration.data.attributeMetadata.ObjectTypeCode;
        var fetchXml = "<fetch version='1.0' output-format='xml-platform' mapping='logical' distinct='false' >" +
                      "<entity name='systemform' >" +
                        "<attribute name='formxml' />" +
                        "<attribute name='name' />" +
                        "<filter type='and' >" +
                          "<condition attribute='formactivationstate' operator='eq' value='1' />" +
                          "<condition attribute='type' operator='eq' value='2' />" +
                          "<condition attribute='objecttypecode' operator='eq' value='" + objectTypeCode + "' />" +
                        "</filter>" +
                      "</entity>" +
                    "</fetch>";

        MK.WebAPI.Retrieve("systemforms", null, fetchXml, null, fetchFormMetadataCallBack, errorHandler, null, null, null, true);

    };
    var fetchFormMetadataCallBack = function (result) {
        "use strict";
        if (!result) {
            callBacks.Error(new Error("Model Kit: Does not have access to system/custom entity attributes. Please contact System Administrator."));
            return;
        }
        modelGeneration.data.formMetadata = result.value;
        callBacks.Success();
    };
    var errorHandler = function (error) {
        "use strict";
        if (callBacks.Error)
            callBacks.Error(error);
        else
            Xrm.Utility.alertDialog(error.message, null);
    };
    var cleadGlobalData = function () {
        "use strict";
        callBacks.Success = null;
        callBacks.Error = errorHandler;
    };
    return {
        FetchMasterData: fetchAllData,
        FetchAttributeMetadata: fetchAttributeMetadata
    };

}();