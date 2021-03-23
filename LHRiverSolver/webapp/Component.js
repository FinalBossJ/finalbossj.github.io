sap.ui.define([
   "sap/ui/core/UIComponent",
   "sap/ui/model/json/JSONModel",
   "sap/ui/model/resource/ResourceModel"
], function (UIComponent, JSONModel, ResourceModel) {
   "use strict";
   return UIComponent.extend("opensap.myapp.Component", {
            metadata : {
		rootView: "opensap.myapp.view.Main"
	},
      init : function () {
         // call the init function of the parent
         UIComponent.prototype.init.apply(this, arguments);

         // set i18n model
         var i18nModel = new ResourceModel({
            bundleName : "opensap.myapp.i18n.i18n"
         });
         this.setModel(i18nModel, "i18n");
      }
   });
});