<template>
  <n-modal
    v-model:show="showModal"
    :title="t('updater.updateAvailable')"
    preset="dialog"
    :show-icon="false"
    :mask-closable="false"
    :closable="!isDownloading"
  >
    <div class="py-4">
      <p class="mb-4 text-lg font-medium">
        {{ t('updater.newVersion', { version: updateInfo?.version || '' }) }}
      </p>
      
      <div v-if="updateInfo?.releaseNotes" class="mb-6">
        <h4 class="font-bold mb-2">{{ t('updater.releaseNotes') }}:</h4>
        <div 
          class="text-sm bg-gray-100 dark:bg-gray-800 p-3 rounded max-h-40 overflow-y-auto"
          v-html="updateInfo.releaseNotes"
        ></div>
      </div>

      <div v-if="isDownloading" class="mt-4">
        <div class="flex justify-between mb-1 text-sm">
          <span>{{ t('updater.downloading') }}</span>
          <span>{{ downloadPercent }}%</span>
        </div>
        <n-progress
          type="line"
          :percentage="downloadPercent"
          :indicator-placement="'inside'"
          processing
        />
        <div class="text-xs text-gray-500 mt-2 text-right">
          {{ downloadSpeed }}
        </div>
      </div>
    </div>

    <template #action>
      <n-button
        v-if="!isDownloading && !isDownloaded"
        type="primary"
        @click="startDownload"
      >
        {{ t('updater.downloadUpdate') }}
      </n-button>
      <n-button
        v-if="isDownloaded"
        type="success"
        @click="quitAndInstall"
      >
        {{ t('updater.restartToInstall') }}
      </n-button>
    </template>
  </n-modal>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { NModal, NButton, NProgress, useMessage } from 'naive-ui';
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
const message = useMessage();

const showModal = ref(false);
const updateInfo = ref<any>(null);
const isDownloading = ref(false);
const isDownloaded = ref(false);
const downloadPercent = ref(0);
const downloadSpeed = ref('');

const handleUpdateEvent = (_event: any, data: any) => {
  switch (data.type) {
    case 'checking-for-update':
      // 可以静默处理，或在设置页面触发时显示 message
      break;
    case 'update-available':
      updateInfo.value = data.info;
      showModal.value = true;
      break;
    case 'update-not-available':
      // 可以在手动检查时通过 event bus 或 state 通知
      break;
    case 'error':
      isDownloading.value = false;
      message.error(t('updater.updateError', { error: data.error }));
      break;
    case 'download-progress':
      isDownloading.value = true;
      downloadPercent.value = Math.floor(data.progress.percent);
      downloadSpeed.value = formatBytes(data.progress.bytesPerSecond) + '/s';
      break;
    case 'update-downloaded':
      isDownloading.value = false;
      isDownloaded.value = true;
      downloadPercent.value = 100;
      break;
  }
};

const startDownload = async () => {
  isDownloading.value = true;
  await window.updater.download();
};

const quitAndInstall = async () => {
  await window.updater.quitAndInstall();
};

const formatBytes = (bytes: number, decimals = 2) => {
  if (!+bytes) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

onMounted(() => {
  if (window.updater) {
    window.updater.onUpdateEvent(handleUpdateEvent);
    // 启动时自动检查更新
    setTimeout(() => {
      window.updater.check().catch(console.error);
    }, 5000);
  }
});

onUnmounted(() => {
  if (window.updater) {
    window.updater.offUpdateEvent(handleUpdateEvent);
  }
});
</script>
