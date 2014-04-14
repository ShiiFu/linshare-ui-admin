'use strict';

angular.module('myApp.services')
  .factory('DomainPolicy', ['$log', 'Restangular', 'Notification',
    function ($log, Restangular, Notification) {
      this.currentDomainPolicy = undefined;

      var self = this;

      // Public API here
      return {
        getAll: function(successCallback) {
          $log.debug('DomainPolicy:getAll');
          return Restangular.all('domain_policies').getList().then(
            function success(domainPolicies) {
              if (successCallback) {
                return successCallback(domainPolicies);
              }
            },
            function error(response) {
              $log.error(
                [
                 'DomainPolicy:getAll',
                 'Unable to get all domain policies',
                ].join('\n')
              );
            }
          );
        },
        getAllRuleTypes: function(successCallback) {
          $log.debug('DomainPolicy:getAllRuleTypes');
          return Restangular.all('domain_policies').all('rule_types').getList().then(
            function success(ruleTypes) {
              if (successCallback) {
                return successCallback(ruleTypes);
              }
            },
            function error(response) {
              $log.error(
                [
                 'DomainPolicy:getAllRuleTypes',
                 'Unable to get all rule types',
                ].join('\n')
              );
            }
          );
        },
        add: function(domainPolicy, successCallback) {
          $log.debug('DomainPolicy:add');
          return Restangular.all('domain_policies').post(domainPolicy).then(
            function success(domainPolicy) {
              Notification.addSuccess('P_Domains-DomainPolicies_CreateSuccess');
              if (successCallback) {
                return successCallback(domainPolicy);
              }
            },
            function error(response) {
              $log.error(
                [
                 'DomainPolicy:add',
                 'Unable to add a domain policy',
                ].join('\n')
              );
              $log.error(domainPolicy);
            }
          );
        },
        update: function(domainPolicy, successCallback) {
          $log.debug('DomainPolicy:update');
          return domainPolicy.put().then(
            function success(domainPolicy) {
              Notification.addSuccess('P_Domains-DomainPolicies_UpdateSuccess');
              if (successCallback) {
                return successCallback(domainPolicy);
              }
            },
            function error(response) {
              $log.error(
                [
                 'DomainPolicy:update',
                 'Unable to update domain policy',
                ].join('\n')
              );
              $log.error(domainPolicy);
            }
          );
        },
        remove: function(domainPolicy, successCallback) {
          $log.debug('DomainPolicy:remove');
          return domainPolicy.remove().then(
            function success(domainPolicy) {
              Notification.addSuccess('P_Domains-Policies_DeleteSuccess');
              if (successCallback) {
                return successCallback(domainPolicy);
              }
            },
            function error(response) {
              $log.error(
                [
                 'DomainPolicy:remove',
                 'Unable to remove domain policy',
                ].join('\n')
              );
              $log.error(domainPolicy);
            }
          );
        },
        setCurrent: function(domainPolicy) {
          $log.debug('DomainPolicy:setCurrent');
          self.currentDomainPolicy = domainPolicy;
        },
        getCurrent: function() {
          return self.currentDomainPolicy;
        },
        currentIsDefined: function() {
          return angular.isDefined(self.currentDomainPolicy);
        }
      };
    }
  ]
);
