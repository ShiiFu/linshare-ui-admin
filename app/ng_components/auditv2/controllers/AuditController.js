/**
 * AuditController Controller
 * @namespace Audit
 * @memberOf linshareAdminApp
 */
(function() {
  'use strict';

  angular
    .module('linshareAdminApp')
    .controller('AuditController', AuditController);

  AuditController.$inject = ['_', '$filter', '$scope', '$translate', '$translatePartialLoader', 'auditDetailsService',
    'auditRestService', 'lsAppConfig', 'ngTableParams'];

  /**
   * @namespace AuditController
   * @desc Application audit management system controller
   * @memberOf linshareAdminApp
   */
  function AuditController(_, $filter, $scope, $translate, $translatePartialLoader, auditDetailsService,
                           auditRestService, lsAppConfig, ngTableParams) {
    /* jshint validthis: true */
    var auditVm = this;

    const
      EN_DATE_FORMAT = lsAppConfig.dateFormat.en,
      FR_DATE_FORMAT = lsAppConfig.dateFormat.fr;

    auditVm.beginDate = new Date();
    auditVm.endDate = new Date();
    auditVm.findAuditActionsByDate = findAuditActionsByDate;
    auditVm.maxDate = new Date();

    activate();

    ////////////

    /**
     * @name activate
     * @desc Activation function of the controller, launch at every instantiation
     * @memberOf linshareAdminApp.AuditController
     */
    function activate() {
      $translatePartialLoader.addPart('audit');
      $translate.refresh();

      auditVm.titleKey = lsAppConfig.auditV1hidden ? 'COMMON.TAB.AUDIT' : 'COMMON.TAB.AUDIT_V2';

      auditVm.dateFormat = $translate.use() === 'fr' ? FR_DATE_FORMAT : EN_DATE_FORMAT;
      auditVm.beginDate.setDate(auditVm.beginDate.getDate() - 7);

      findAuditActionsByDate();
    }

    /**
     * @name findAuditActionsByDate
     * @desc Get audit actions from server and apply them to the tableParam with related filters
     * @memberOf linshareAdminApp.AuditController
     */
    function findAuditActionsByDate() {
      auditVm.beginDate.setHours(0, 0, 0, 0);
      auditVm.endDate.setHours(24, 0, 0, 0);

      auditRestService.getList({
        beginDate: auditVm.beginDate.toISOString(),
        endDate: auditVm.endDate.toISOString()
      }).then(function(auditActionsList) {
        auditVm.itemsList = auditActionsList.plain();

        auditDetailsService.generateAllDetails($scope.userLogged.uuid, auditVm.itemsList);

        if (_.isUndefined(auditVm.tableParams)) {
          launchTableParamsInitiation();
        } else {
          auditVm.tableParams.reload();
        }
      });
    }

    /**
     * @name launchTableParamsInitiation
     * @desc Initialize tableParams and related functions
     * @memberOf linshareAdminApp.AuditController
     */
    function launchTableParamsInitiation() {
      auditVm.tableParams = new ngTableParams({
        page: 1,
        count: 25,
        sorting: {
          creationDate: 'desc'
        }
      }, {
        debugMode: false,
        total: 0,
        getData: function($defer, params) {
          var orderedData = params.sorting() ? $filter('orderBy')(auditVm.itemsList, params.orderBy()) : auditVm.itemsList;
          orderedData = params.filter ? $filter('filter')(orderedData, params.filter()) : orderedData;
          params.total(orderedData.length);
          $defer.resolve(orderedData.slice((params.page() - 1) * params.count(), params.page() * params.count()));
        }
      });
    }
  }
})();
