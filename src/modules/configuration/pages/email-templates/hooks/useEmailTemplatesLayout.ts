import { reactive, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { STATUS } from '@/core/types/Status';
import { MailLayout } from '../types/MailLayout';
import message from 'ant-design-vue/lib/message';
import { APIError } from '@/core/types/APIError';
import { DEFAULT_PAGE_SIZE } from '@/core/constants';
import { createMailLayout, getLayoutEmailTemplates, deleteMailLayout } from '../services/email-templates-api';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '@/modules/auth/store';
import { ACCOUNT_ROLE } from '@/modules/user/types/User';
import { useDomainStore } from '@/modules/domain/store';
import { useLocalStorage } from '@vueuse/core';

const list = ref<MailLayout[]>([]);
const loading = ref(false);
const activeMailLayout = useLocalStorage<MailLayout>(
  'configuration-type-mail-layout-activeMailLayout',
  {} as MailLayout
);
const selectedMailLayouts = ref<MailLayout[]>();
const status = ref(STATUS.LOADING);
const pagination = reactive({
  total: 0,
  current: 1,
  pageSize: DEFAULT_PAGE_SIZE,
});
const filterText = ref('');
const modal = reactive<{
  type:
    | 'CREATE_LAYOUT_EMAIL'
    | 'ASSIGN_LAYOUT_EMAIL'
    | 'DELETE_LAYOUT_EMAIL'
    | 'DELETE_LAYOUTS_EMAIL'
    | 'DELETE_LAYOUTS_FAIL_EMAIL';
  visible: boolean;
  multipleDeleteResponse?: {
    total: number;
    totalSuccess: number;
    totalFail: number;
    totalAssignCases: number;
    totalUnAuthoCases: number;
  };
}>({
  type: 'CREATE_LAYOUT_EMAIL',
  visible: false,
});
export default function useEmailTemplatesLayout() {
  //composable
  const { t } = useI18n();
  const { loggedUserRole } = storeToRefs(useAuthStore());
  const { getDomainsList, currentDomain } = storeToRefs(useDomainStore());

  //methods

  function onCloseModal() {
    modal.visible = false;
  }

  function onCreateMailLayout(email: MailLayout) {
    activeMailLayout.value = email;
    modal.type = 'CREATE_LAYOUT_EMAIL';
    modal.visible = true;
  }

  function onDeleteMailLayout(mailLayout: MailLayout) {
    activeMailLayout.value = mailLayout;
    modal.type = 'DELETE_LAYOUT_EMAIL';
    modal.visible = true;
  }

  function onDeleteMailLayoutsFail(response: {
    total: number;
    totalSuccess: number;
    totalFail: number;
    totalAssignCases: number;
    totalUnAuthoCases: number;
  }) {
    modal.type = 'DELETE_LAYOUTS_FAIL_EMAIL';
    modal.visible = true;
    modal.multipleDeleteResponse = response;
  }

  function onDeleteMailLayouts() {
    modal.type = 'DELETE_LAYOUTS_EMAIL';
    modal.visible = true;
  }

  async function handleGetEmailLayoutTemplates(domainUuid: string) {
    try {
      status.value = STATUS.LOADING;
      const templates = await getLayoutEmailTemplates(domainUuid, true);
      list.value = templates?.map((item) => {
        return { ...item, assigned: isAssigned(item.uuid, currentDomain.value.mailLayout?.uuid) };
      });
      status.value = STATUS.SUCCESS;
      return;
    } catch (error) {
      status.value = STATUS.ERROR;
      if (error instanceof APIError) {
        message.error(error.getMessage());
      }
    } finally {
      status.value = STATUS.SUCCESS;
    }
  }
  function isAssigned(mailLayoutUuid: string, currentDomainMailLayoutUuid: string | undefined) {
    if (mailLayoutUuid === currentDomainMailLayoutUuid) {
      return true;
    }
    return false;
  }

  async function handleDeleteMailLayout(activeMailLayout: MailLayout) {
    try {
      if (!activeMailLayout || !activeMailLayout?.uuid) {
        return false;
      }
      loading.value = true;
      if (activeMailLayout?.assigned) {
        message.error(t('EMAIL_TEMPLATES.DELETE_LAYOUT_MODAL.DELETE_ERROR_ASSIGNED'));
        loading.value = false;
        return false;
      }
      await deleteMailLayout({ uuid: activeMailLayout?.uuid });
      onCloseModal();
      return true;
    } catch (error) {
      if (error instanceof APIError) {
        if (error.errorCode === 16666) {
          onCloseModal();
          message.error(t('EMAIL_TEMPLATES.DELETE_LAYOUT_MODAL.DELETE_ERROR_ASSIGNED'));
        } else if (error.errorCode === 166678) {
          onCloseModal();
          message.error(t('EMAIL_TEMPLATES.DELETE_LAYOUT_MODAL.DELETE_ERROR_UNAUTHORIZED'));
        } else {
          onCloseModal();
          message.error(error.getMessage());
        }
      }
    } finally {
      loading.value = false;
    }
  }

  async function handleDeleteMailLayouts() {
    try {
      if (!selectedMailLayouts?.value?.length) {
        message.error(t('EMAIL_TEMPLATES.DELETE_LAYOUT_MODAL.DELETE_MODAL_EMPTY'));
        return {
          total: selectedMailLayouts?.value?.length,
          totalSuccess: 0,
          totalFail: selectedMailLayouts?.value?.length,
          totalAssignCases: 0,
          totalUnAuthoCases: 0,
        };
      }

      loading.value = true;
      const deletePromises = selectedMailLayouts.value?.map((item) => {
        return deleteMailLayout({ uuid: item?.uuid });
      });
      if (!deletePromises) {
        return {
          total: selectedMailLayouts?.value?.length,
          totalSuccess: 0,
          totalFail: selectedMailLayouts?.value?.length,
          totalAssignCases: 0,
          totalUnAuthoCases: 0,
        };
      }

      return await Promise.allSettled(deletePromises).then((results) => {
        return {
          total: selectedMailLayouts?.value?.length,
          totalSuccess: results.filter((item) => item.status === 'fulfilled')?.length ?? 0,
          totalFail: results.filter((item) => item.status === 'rejected')?.length ?? 0,
          totalAssignCases:
            results.filter((item) => item.status === 'rejected' && item.reason?.errorCode === 16666)?.length ?? 0,
          totalUnAuthoCases:
            results.filter((item) => item.status === 'rejected' && item.reason?.errorCode === 166678)?.length ?? 0,
        };
      });
    } catch (error) {
      return {
        total: selectedMailLayouts?.value?.length,
        totalSuccess: 0,
        totalFail: selectedMailLayouts?.value?.length,
        totalAssignCases: 0,
        totalUnAuthoCases: 0,
      };
    } finally {
      loading.value = false;
    }
  }

  function checkingEmailLayoutsDomainAuthorized(domainUuid: string) {
    if (!domainUuid) {
      return false;
    }
    if (loggedUserRole.value === ACCOUNT_ROLE.SUPERADMIN) {
      return true;
    } else {
      return (
        getDomainsList.value.some((item) => {
          return item.uuid === domainUuid;
        }) && loggedUserRole?.value === ACCOUNT_ROLE.ADMIN
      );
    }
  }

  async function handleCreateMailLayout(payload: {
    description: string;
    domain: string;
    domainName: string;
    layout: string;
    messagesEnglish: string;
    messagesFrench: string;
    messagesRussian: string;
    visible: boolean;
    readonly: boolean;
  }) {
    try {
      loading.value = true;
      await createMailLayout(payload);
      message.success(t('EMAIL_TEMPLATES.CREATE_MODAL.CREATE_SUCCESS'));
      return true;
    } catch (error) {
      if (error instanceof APIError) {
        message.error(error.getMessage());
      }
      return false;
    } finally {
      loading.value = false;
    }
  }

  return {
    list,
    modal,
    status,
    loading,
    filterText,
    pagination,
    activeMailLayout,
    selectedMailLayouts,
    onCloseModal,
    onDeleteMailLayout,
    onCreateMailLayout,
    onDeleteMailLayouts,
    handleDeleteMailLayout,
    handleDeleteMailLayouts,
    onDeleteMailLayoutsFail,
    handleGetEmailLayoutTemplates,
    checkingEmailLayoutsDomainAuthorized,
    handleCreateMailLayout,
  };
}
