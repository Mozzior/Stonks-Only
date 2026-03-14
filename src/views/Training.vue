<template>
  <div
    class="h-full flex flex-col gap-4"
    :style="
      isTrainingStarted
        ? {
            position: 'fixed',
            inset: '0',
            zIndex: 2000,
            height: '100vh',
            width: '100vw',
            background: 'var(--color-bg-body)',
            overflow: 'hidden',
          }
        : undefined
    "
  >
    <!-- Header: Mode & Info -->
    <div
      class="flex-none flex items-center justify-between bg-[var(--color-bg-card)] p-4 rounded-xl shadow-sm border border-[var(--color-border)]"
      v-if="!isTrainingStarted"
    >
      <div class="flex items-center gap-6">
        <div class="flex flex-col">
          <span
            class="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider"
            >{{ t("training.header.tradingSymbol") }}</span
          >
          <span class="text-lg font-bold text-[var(--color-text-primary)]"
            >{{ currentStockName }} ({{ currentStockSymbol }})</span
          >
        </div>
        <n-divider vertical />
        <div class="flex flex-col">
          <span
            class="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider"
            >{{ t("training.header.timeframe") }}</span
          >
          <n-popselect
            v-model:value="currentTimeframe"
            :options="timeframeOptions"
            trigger="click"
            @update:value="handleTimeframeChange"
          >
            <n-button quaternary size="small" class="font-bold">
              {{
                timeframeOptions.find((o) => o.value === currentTimeframe)
                  ?.label || currentTimeframe
              }}
              <n-icon :component="ChevronDownOutline" class="ml-1" />
            </n-button>
          </n-popselect>
        </div>
        <n-divider vertical />
        <div class="flex flex-col">
          <span
            class="text-xs text-[var(--color-text-secondary)] uppercase font-bold tracking-wider"
            >{{ t("training.header.accountBalance") }}</span
          >
          <span class="text-lg font-bold text-[var(--color-brand-primary)]"
            >$125,430.50</span
          >
        </div>
      </div>

      <div class="flex items-center gap-2">
        <n-tooltip trigger="hover">
          <template #trigger>
            <n-button quaternary circle @click="showHelp = true">
              <template #icon
                ><n-icon :component="HelpCircleOutline"
              /></template>
            </n-button>
          </template>
          {{ t("training.header.trainingGuide") }}
        </n-tooltip>
      </div>
    </div>

    <!-- Main Content: Chart & Side Panel -->
    <div
      class="flex-1 flex min-h-0 relative"
      :class="isTrainingStarted ? 'gap-0' : 'gap-4'"
    >
      <!-- Session Mode Drawing Toolbar (Left) -->
      <div
        v-if="isTrainingStarted"
        class="w-12 flex flex-col items-center py-2 bg-[var(--color-bg-card)] border-r border-[var(--color-border)] z-30 gap-4"
      >
        <!-- Cursor Tools -->
        <n-popover placement="right" trigger="hover">
          <template #trigger>
            <n-button
              quaternary
              circle
              size="small"
              :type="!currentDrawingTool ? 'primary' : 'default'"
              @click="setDrawingTool('cursor')"
            >
              <template #icon><n-icon :component="ScanOutline" /></template>
            </n-button>
          </template>
          <span>{{ t("training.toolbar.crosshair") }}</span>
        </n-popover>

        <n-divider style="margin: 0" />

        <!-- Dynamic Drawing Tools from Config -->
        <div
          v-for="(group, index) in drawingTools"
          :key="index"
          class="flex flex-col gap-2"
        >
          <n-popover placement="right" trigger="hover">
            <template #trigger>
              <n-button
                quaternary
                circle
                size="small"
                :type="
                  group.items.some((i) => currentDrawingTool === i.key)
                    ? 'primary'
                    : 'default'
                "
              >
                <template #icon>
                  <n-icon :component="group.items[0].icon" />
                </template>
              </n-button>
            </template>
            <div class="flex flex-col gap-1">
              <span
                class="text-xs font-bold text-[var(--color-text-secondary)] mb-1"
                >{{ group.group }}</span
              >
              <n-button
                v-for="item in group.items"
                :key="item.key"
                size="tiny"
                ghost
                class="justify-start"
                @click="setDrawingTool(item.key)"
                :type="currentDrawingTool === item.key ? 'primary' : 'default'"
              >
                <template #icon><n-icon :component="item.icon" /></template>
                {{ item.label }}
              </n-button>
            </div>
          </n-popover>
        </div>

        <n-divider style="margin: 0" />

        <!-- Additional Tools -->
        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button quaternary circle size="small" @click="takeScreenshot">
              <template #icon><n-icon :component="CameraOutline" /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.screenshot") }}
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button quaternary circle size="small" @click="saveLayout">
              <template #icon><n-icon :component="SaveOutline" /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.saveLayout") }}
        </n-tooltip>

        <n-divider style="margin: 0" />

        <!-- Magnet & Lock -->
        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button
              quaternary
              circle
              size="small"
              :type="isMagnetMode ? 'primary' : 'default'"
              @click="isMagnetMode = !isMagnetMode"
            >
              <template #icon><n-icon :component="MagnetOutline" /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.magnetMode") }}
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button
              quaternary
              circle
              size="small"
              :type="isDrawingLocked ? 'primary' : 'default'"
              @click="isDrawingLocked = !isDrawingLocked"
            >
              <template #icon
                ><n-icon :component="LockClosedOutline"
              /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.lockDrawing") }}
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button quaternary circle size="small" @click="clearDrawings">
              <template #icon><n-icon :component="TrashOutline" /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.clearDrawings") }}
        </n-tooltip>

        <n-tooltip placement="right" trigger="hover">
          <template #trigger>
            <n-button quaternary circle size="small" @click="showChartSettings">
              <template #icon><n-icon :component="SettingsOutline" /></template>
            </n-button>
          </template>
          {{ t("training.toolbar.settings") }}
        </n-tooltip>
      </div>

      <!-- Left: K-Line Chart -->
      <div
        class="flex-1 bg-[var(--color-bg-card)] flex flex-col overflow-hidden relative transition-all duration-300"
        :class="
          isTrainingStarted
            ? 'border-none rounded-none w-full h-full'
            : 'rounded-xl border border-[var(--color-border)]'
        "
      >
        <!-- Chart Toolbar -->
        <div
          class="flex-none h-12 flex items-center justify-between px-4 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)]"
        >
          <div class="flex items-center gap-4">
            <!-- Timeframe Selector (Expanded in Session) -->
            <n-popselect
              v-if="isTrainingStarted"
              v-model:value="currentTimeframe"
              :options="timeframeOptions"
              trigger="click"
              @update:value="handleTimeframeChange"
            >
              <n-button text class="font-bold">
                {{
                  timeframeOptions.find((o) => o.value === currentTimeframe)
                    ?.label || currentTimeframe
                }}
                <n-icon :component="ChevronDownOutline" class="ml-1" />
              </n-button>
            </n-popselect>

            <!-- Chart Type Selector -->
            <n-popselect
              v-if="isTrainingStarted"
              v-model:value="currentChartType"
              :options="chartTypeOptions"
              trigger="click"
              @update:value="handleChartTypeChange"
            >
              <n-button quaternary size="small">
                <template #icon
                  ><n-icon :component="AnalyticsOutline"
                /></template>
                <span class="ml-1 hidden sm:inline">{{
                  chartTypeOptions.find((o) => o.value === currentChartType)
                    ?.label
                }}</span>
                <n-icon :component="ChevronDownOutline" class="ml-1" />
              </n-button>
            </n-popselect>

            <n-divider vertical v-if="isTrainingStarted" />

            <!-- Indicator Selector (Expanded) -->
            <n-popover
              trigger="click"
              placement="bottom-start"
              v-if="isTrainingStarted"
            >
              <template #trigger>
                <n-button quaternary size="small">
                  <template #icon
                    ><n-icon :component="LayersOutline"
                  /></template>
                  {{ t("training.toolbar.indicators") }}
                </n-button>
              </template>
              <div class="grid grid-cols-3 gap-2 w-64">
                <n-button
                  v-for="ind in indicatorOptions"
                  :key="ind.key"
                  size="tiny"
                  :type="indicators.includes(ind.key) ? 'primary' : 'default'"
                  ghost
                  @click="toggleIndicator(ind.key)"
                >
                  {{ ind.label }}
                </n-button>
              </div>
            </n-popover>

            <n-button-group size="small" v-if="isTrainingStarted">
              <n-button
                ghost
                :disabled="!isDailyTrainingMode"
                @click="stepBackward"
              >
                <template #icon
                  ><n-icon :component="PlayBackOutline"
                /></template>
              </n-button>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button
                    type="primary"
                    v-if="!isPlaying"
                    :disabled="!isDailyTrainingMode"
                    @click="togglePlay"
                  >
                    <template #icon
                      ><n-icon :component="PlayOutline"
                    /></template>
                  </n-button>
                  <n-button
                    type="warning"
                    v-else
                    :disabled="!isDailyTrainingMode"
                    @click="togglePlay"
                  >
                    <template #icon
                      ><n-icon :component="PauseOutline"
                    /></template>
                  </n-button>
                </template>
                {{
                  isPlaying
                    ? t("training.toolbar.pause")
                    : t("training.toolbar.play")
                }}
              </n-tooltip>
              <n-tooltip trigger="hover">
                <template #trigger>
                  <n-button
                    ghost
                    :disabled="!isDailyTrainingMode"
                    @click="stepForward"
                  >
                    <template #icon
                      ><n-icon :component="PlayForwardOutline"
                    /></template>
                  </n-button>
                </template>
                {{ t("training.toolbar.stepForward") }}
              </n-tooltip>
            </n-button-group>

            <!-- Drawing Tools (Hidden in Session Mode as they are on the left) -->
            <!-- Removed drawing tools from simplified view as requested -->

            <n-space :size="4" v-if="!isTrainingStarted">
              <n-button
                size="tiny"
                :secondary="!indicators.includes('MA')"
                :type="indicators.includes('MA') ? 'primary' : 'default'"
                @click="toggleIndicator('MA')"
                >MA</n-button
              >
              <n-button
                size="tiny"
                :secondary="!indicators.includes('BOLL')"
                :type="indicators.includes('BOLL') ? 'primary' : 'default'"
                @click="toggleIndicator('BOLL')"
                >BOLL</n-button
              >
              <n-button
                size="tiny"
                :secondary="!indicators.includes('MACD')"
                :type="indicators.includes('MACD') ? 'primary' : 'default'"
                @click="toggleIndicator('MACD')"
                >MACD</n-button
              >
              <n-button
                size="tiny"
                :secondary="!indicators.includes('RSI')"
                :type="indicators.includes('RSI') ? 'primary' : 'default'"
                @click="toggleIndicator('RSI')"
                >RSI</n-button
              >
            </n-space>
          </div>

          <div class="flex items-center gap-2">
            <!-- Training Status Indicator -->
            <div
              v-if="isTrainingStarted"
              class="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-sidebar)] rounded border border-[var(--color-border)]"
            >
              <div
                class="w-2 h-2 rounded-full"
                :class="
                  isTrainingWindowEnded
                    ? 'bg-[var(--color-warning)]'
                    : 'bg-[var(--color-success)] animate-pulse'
                "
              ></div>
              <span
                class="text-xs font-bold"
                :class="
                  isTrainingWindowEnded
                    ? 'text-[var(--color-warning)]'
                    : 'text-[var(--color-success)]'
                "
              >
                {{
                  isTrainingWindowEnded
                    ? "训练已结束"
                    : t("training.toolbar.liveSession")
                }}
              </span>
            </div>
            <div
              v-if="isTrainingStarted"
              class="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-sidebar)] rounded border border-[var(--color-border)]"
            >
              <span class="text-xs text-[var(--color-text-secondary)]"
                >剩余K线</span
              >
              <span
                class="text-xs font-bold text-[var(--color-brand-primary)]"
                >{{ remainingTrainingBars }}</span
              >
            </div>
            <div
              v-if="isTrainingStarted"
              class="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-sidebar)] rounded border border-[var(--color-border)]"
            >
              <span class="text-xs text-[var(--color-text-secondary)]"
                >训练区间</span
              >
              <span class="text-xs font-bold text-[var(--color-text-primary)]"
                >{{ trainingStartDateText }} ~ {{ trainingEndDateText }}</span
              >
            </div>

            <n-tooltip trigger="hover" v-if="isTrainingStarted">
              <template #trigger>
                <div
                  class="flex items-center gap-1 bg-[var(--color-bg-card)] px-2 py-1 rounded border border-[var(--color-border)] cursor-pointer hover:border-[var(--color-brand-primary)] transition-colors"
                >
                  <n-icon
                    :component="SpeedometerOutline"
                    class="text-[var(--color-text-secondary)]"
                  />
                  <span class="text-xs font-bold w-4 text-center"
                    >{{ playSpeed }}x</span
                  >
                </div>
              </template>
              <div class="w-32 p-2">
                <span
                  class="text-xs text-[var(--color-text-secondary)] mb-1 block"
                  >{{ t("training.toolbar.playbackSpeed") }}</span
                >
                <n-slider
                  v-model:value="playSpeed"
                  :min="1"
                  :max="5"
                  :step="1"
                  :tooltip="false"
                />
              </div>
            </n-tooltip>

            <!-- Quick Trade Toggle -->
            <n-tooltip trigger="hover" v-if="isTrainingStarted">
              <template #trigger>
                <n-button
                  quaternary
                  circle
                  size="small"
                  :type="showQuickTrade ? 'primary' : 'default'"
                  @click="showQuickTrade = !showQuickTrade"
                >
                  <template #icon
                    ><n-icon :component="FlashOutline"
                  /></template>
                </n-button>
              </template>
              {{ t("training.toolbar.quickTrade") }}
            </n-tooltip>

            <n-divider vertical v-if="isTrainingStarted" />

            <n-button
              v-if="!isTrainingStarted"
              type="primary"
              size="small"
              @click="startTraining"
              class="animate-pulse font-bold"
            >
              {{ t("training.toolbar.startSession") }}
            </n-button>
            <n-button
              v-else
              type="error"
              ghost
              size="small"
              @click="exitTraining"
            >
              {{ t("training.toolbar.endSession") }}
            </n-button>
          </div>
        </div>

        <!-- Floating Order Controls for Training Mode -->
        <div
          v-if="isTrainingStarted && showQuickTrade"
          class="absolute bottom-6 right-6 z-30 flex flex-col gap-2 bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)] shadow-xl w-64"
        >
          <div class="flex justify-between items-center mb-2">
            <span
              class="text-xs font-bold text-[var(--color-text-secondary)]"
              >{{ t("training.trade.quickTradeTitle") }}</span
            >
            <span class="text-xs font-mono"
              >${{ currentPrice.toFixed(2) }}</span
            >
          </div>

          <div class="flex gap-2">
            <n-button
              type="primary"
              class="flex-1"
              :disabled="isTrainingWindowEnded"
              @click="handleTrade('BUY')"
              >{{ t("training.trade.buyLong") }}</n-button
            >
            <n-button
              type="error"
              class="flex-1"
              :disabled="isTrainingWindowEnded"
              @click="handleTrade('SELL')"
              >{{ t("training.trade.sellShort") }}</n-button
            >
          </div>

          <div
            class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]"
          >
            <span class="text-xs text-[var(--color-text-secondary)]"
              >{{ t("training.trade.position") }}:</span
            >
            <span
              v-if="position"
              :class="
                position.pl >= 0
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
              "
              class="font-bold text-sm"
            >
              {{ position.pl >= 0 ? "+" : "" }}{{ position.pl }}%
            </span>
            <span v-else class="text-xs text-[var(--color-text-secondary)]"
              >None</span
            >
          </div>

          <n-button
            v-if="position"
            size="tiny"
            type="warning"
            ghost
            class="mt-1"
            :disabled="isTrainingWindowEnded"
            @click="closePosition"
            >{{ t("training.trade.closeAll") }}</n-button
          >
        </div>

        <!-- Chart Container -->
        <div
          class="flex-1 w-full relative bg-[var(--color-bg-sidebar)] flex items-center justify-center group"
        >
          <div ref="chartRef" class="absolute inset-0 w-full h-full"></div>
          <div
            v-if="!isChartLoaded"
            class="z-10 text-[var(--color-text-secondary)] flex flex-col items-center gap-2"
          >
            <n-spin size="large" />
            <span class="text-sm">Loading historical data...</span>
          </div>
        </div>
      </div>

      <!-- Right: Order Panel & Positions -->
      <div class="w-80 flex flex-col gap-4" v-show="!isTrainingStarted">
        <!-- Order Panel -->
        <n-card
          :title="t('training.trade.executeTrade')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]"
        >
          <n-tabs type="segment" animated>
            <n-tab-pane name="buy" :tab="t('training.trade.buy')">
              <div class="space-y-4 pt-4">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-[var(--color-text-secondary)]">{{
                    t("training.trade.orderType")
                  }}</span>
                  <n-select
                    v-model:value="orderType"
                    :options="orderTypeOptions"
                    size="small"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-[var(--color-text-secondary)]">{{
                    t("training.trade.amountShares")
                  }}</span>
                  <n-input-number
                    v-model:value="tradeAmount"
                    :min="100"
                    :step="100"
                    class="w-full"
                  />
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <n-button
                    v-for="p in [10, 25, 50, 100]"
                    :key="p"
                    size="tiny"
                    ghost
                    @click="setAmountByPercent(p)"
                    >{{ p }}%</n-button
                  >
                </div>
                <n-button
                  type="primary"
                  block
                  size="large"
                  class="font-bold mt-4"
                  :disabled="isTrainingWindowEnded"
                  @click="handleTrade('BUY')"
                >
                  {{ t("training.trade.buyLong") }}
                </n-button>
              </div>
            </n-tab-pane>
            <n-tab-pane name="sell" :tab="t('training.trade.sell')">
              <div class="space-y-4 pt-4">
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-[var(--color-text-secondary)]">{{
                    t("training.trade.orderType")
                  }}</span>
                  <n-select
                    v-model:value="orderType"
                    :options="orderTypeOptions"
                    size="small"
                  />
                </div>
                <div class="flex flex-col gap-1">
                  <span class="text-xs text-[var(--color-text-secondary)]">{{
                    t("training.trade.amountShares")
                  }}</span>
                  <n-input-number
                    v-model:value="tradeAmount"
                    :min="100"
                    :step="100"
                    class="w-full"
                  />
                </div>
                <div class="grid grid-cols-4 gap-2">
                  <n-button
                    v-for="p in [10, 25, 50, 100]"
                    :key="p"
                    size="tiny"
                    ghost
                    @click="setAmountByPercent(p)"
                    >{{ p }}%</n-button
                  >
                </div>
                <n-button
                  type="error"
                  block
                  size="large"
                  class="font-bold mt-4"
                  :disabled="isTrainingWindowEnded"
                  @click="handleTrade('SELL')"
                >
                  {{ t("training.trade.sellShort") }}
                </n-button>
              </div>
            </n-tab-pane>
          </n-tabs>
        </n-card>

        <!-- Current Position -->
        <n-card
          :title="t('training.trade.openPosition')"
          :bordered="false"
          class="flex-1 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden"
        >
          <div v-if="position" class="space-y-4">
            <div class="flex justify-between items-center">
              <n-tag
                :type="position.side === 'LONG' ? 'success' : 'error'"
                size="small"
                class="font-bold"
              >
                {{ position.side }}
              </n-tag>
              <span class="text-xs text-[var(--color-text-secondary)]"
                >{{ position.amount }} Shares</span
              >
            </div>

            <div class="grid grid-cols-2 gap-4">
              <div class="flex flex-col">
                <span class="text-xs text-[var(--color-text-secondary)]">{{
                  t("training.trade.avgEntry")
                }}</span>
                <span
                  class="text-sm font-medium text-[var(--color-text-primary)]"
                  >${{ position.entryPrice }}</span
                >
              </div>
              <div class="flex flex-col items-end">
                <span class="text-xs text-[var(--color-text-secondary)]">{{
                  t("training.trade.marketPrice")
                }}</span>
                <span
                  class="text-sm font-medium text-[var(--color-text-primary)]"
                  >${{ currentPrice }}</span
                >
              </div>
            </div>

            <div
              class="p-3 rounded-lg bg-[var(--color-bg-sidebar)] border border-[var(--color-border)]"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-[var(--color-text-secondary)]">{{
                  t("training.trade.unrealizedPL")
                }}</span>
                <span
                  :class="
                    position.pl >= 0
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  "
                  class="text-lg font-bold"
                >
                  {{ position.pl >= 0 ? "+" : "" }}{{ position.pl }}%
                </span>
              </div>
              <div
                class="flex justify-between text-[10px] text-[var(--color-text-secondary)]"
              >
                <span
                  >{{ t("training.trade.value") }}: ${{
                    (position.amount * currentPrice).toFixed(2)
                  }}</span
                >
                <span
                  >{{ t("training.trade.pl") }}: ${{
                    position.plAmount.toFixed(2)
                  }}</span
                >
              </div>
            </div>

            <n-button
              block
              type="warning"
              ghost
              size="small"
              :disabled="isTrainingWindowEnded"
              @click="closePosition"
              >{{ t("training.trade.closePosition") }}</n-button
            >
          </div>
          <div
            v-else
            class="h-full flex flex-col items-center justify-center text-[var(--color-text-secondary)] italic"
          >
            <n-icon
              size="40"
              :component="AnalyticsOutline"
              class="mb-2 opacity-20"
            />
            <p class="text-xs">{{ t("training.trade.noActivePosition") }}</p>
          </div>
        </n-card>
      </div>
    </div>

    <!-- Bottom: Trade History -->
    <div
      class="h-48 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] flex flex-col overflow-hidden"
      v-show="!isTrainingStarted"
    >
      <div
        class="px-4 py-2 border-b border-[var(--color-border)] bg-[var(--color-bg-sidebar)] flex items-center justify-between"
      >
        <span
          class="text-xs font-bold text-[var(--color-text-secondary)] uppercase tracking-widest"
          >{{ t("training.history.title") }}</span
        >
        <n-button text size="tiny" type="primary">{{
          t("training.history.viewFullJournal")
        }}</n-button>
      </div>
      <div class="flex-1 overflow-auto">
        <n-data-table
          :columns="historyColumns"
          :data="tradeHistory"
          size="small"
          :bordered="false"
          :pagination="false"
        >
          <template #empty>
            <div class="p-4 text-center text-[var(--color-text-secondary)]">
              {{ t("training.history.noTrades") }}
            </div>
          </template>
        </n-data-table>
      </div>
    </div>

    <!-- Help Modal -->
    <n-modal v-model:show="showHelp">
      <n-card
        style="width: 500px"
        :title="t('training.guide.title')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showHelp = false">
            <template #icon><n-icon :component="CloseOutline" /></template>
          </n-button>
        </template>
        <div class="space-y-4 text-[var(--color-text-secondary)]">
          <p>
            {{ t("training.guide.welcome") }}
          </p>
          <ul class="list-disc pl-5 space-y-2">
            <li>
              <strong>{{ t("training.guide.stepping") }}:</strong>
              {{
                t(
                  "training.guide.steppingDesc",
                  "Use 'Forward' to reveal the next candle. This forces you to make decisions based only on visible data.",
                )
              }}
            </li>
            <li>
              <strong>{{ t("training.guide.simulation") }}:</strong>
              {{
                t(
                  "training.guide.simulationDesc",
                  "All trades are executed against historical data at the prices shown on the chart.",
                )
              }}
            </li>
            <li>
              <strong>{{ t("training.guide.strategy") }}:</strong>
              {{
                t(
                  "training.guide.strategyDesc",
                  "Use this environment to test your entry and exit criteria.",
                )
              }}
            </li>
          </ul>
        </div>
      </n-card>
    </n-modal>
    <!-- Chart Settings Modal -->
    <n-modal v-model:show="showSettings">
      <n-card
        style="width: 400px"
        :title="t('training.toolbar.settings')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="showSettings = false">
            <template #icon><n-icon :component="CloseOutline" /></template>
          </n-button>
        </template>

        <div class="space-y-4">
          <div class="flex items-center justify-between">
            <span>{{ t("training.settings.showGrid") }}</span>
            <n-switch
              v-model:value="chartSettings.grid"
              @update:value="updateChartSettings"
            />
          </div>
          <div class="flex items-center justify-between">
            <span>{{ t("training.settings.showCrosshair") }}</span>
            <n-switch
              v-model:value="chartSettings.crosshair"
              @update:value="updateChartSettings"
            />
          </div>
          <div class="flex items-center justify-between">
            <span>{{ t("training.settings.showTooltip") }}</span>
            <n-switch
              v-model:value="chartSettings.tooltip"
              @update:value="updateChartSettings"
            />
          </div>
        </div>
      </n-card>
    </n-modal>

    <!-- Text Input Modal -->
    <n-modal v-model:show="showTextModal">
      <n-card
        style="width: 400px"
        :title="t('training.drawing.enterText')"
        :bordered="false"
        size="huge"
        role="dialog"
        aria-modal="true"
      >
        <template #header-extra>
          <n-button quaternary circle @click="cancelText">
            <template #icon><n-icon :component="CloseOutline" /></template>
          </n-button>
        </template>
        <div class="space-y-4">
          <n-input
            v-model:value="editingText"
            type="text"
            :placeholder="t('training.drawing.textPlaceholder')"
            autofocus
            @keydown.enter="saveText"
          />
          <div class="flex justify-end">
            <n-button type="primary" @click="saveText">{{
              t("common.save")
            }}</n-button>
            <n-button class="ml-2" @click="cancelText">{{
              t("common.cancel")
            }}</n-button>
          </div>
        </div>
      </n-card>
    </n-modal>
  </div>
</template>

<script setup lang="ts">
import {
  ref,
  h,
  onMounted,
  onUnmounted,
  shallowRef,
  watch,
  nextTick,
  computed,
} from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import {
  NDivider,
  NButton,
  NIcon,
  NTooltip,
  NButtonGroup,
  NSlider,
  NCard,
  NTabs,
  NTabPane,
  NSelect,
  NInputNumber,
  NTag,
  NDataTable,
  NModal,
  NSpin,
  useMessage,
  NSpace,
  NPopselect,
  NPopover,
  NSwitch,
} from "naive-ui";
import {
  ChevronDownOutline,
  HelpCircleOutline,
  PlayOutline,
  PauseOutline,
  PlayForwardOutline,
  PlayBackOutline,
  AnalyticsOutline,
  CloseOutline,
  SpeedometerOutline,
  CreateOutline,
  RadioButtonOffOutline,
  ArrowForwardOutline,
  ResizeOutline,
  TextOutline,
  TrashOutline,
  SettingsOutline,
  LayersOutline,
  ScanOutline,
  MagnetOutline,
  LockClosedOutline,
  CameraOutline,
  SaveOutline,
  BrushOutline,
  FlashOutline,
} from "@vicons/ionicons5";
import { init, Chart, dispose, registerOverlay } from "klinecharts";
import type { KLineData, Period, OverlayCreate, CandleType } from "klinecharts";
import { useTheme } from "../composables/useTheme";
import { useLayoutControl } from "../composables/useLayoutControl";
import { supabase } from "../utils/supabase";

const router = useRouter();
const message = useMessage();
const { isDark, candleColorMode } = useTheme();
const { setFullscreen } = useLayoutControl();
const { t } = useI18n();

// State
const isChartLoaded = ref(false);
const chartRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const isTrainingStarted = ref(false);
const showQuickTrade = ref(false);
const playSpeed = ref(2);
const currentTimeframe = ref("daily");
const currentChartType = ref<CandleType>("candle_solid");
const orderType = ref("MARKET");
const tradeAmount = ref(100);
const currentPrice = ref(0);
const showHelp = ref(false);
const indicators = ref<string[]>(["MA", "VOL"]);
const currentDrawingTool = ref<string | null>(null);
const chartInstance = shallowRef<Chart | null>(null);
const isMounted = ref(true);
const isMagnetMode = ref(false);
const isDrawingLocked = ref(false);
const showTextModal = ref(false);
const editingText = ref("");
const pendingTextOverlay = ref<any>(null);
let playInterval: any = null;
let updateDataCallback: ((data: KLineData) => void) | null = null;
let resizeHandler: (() => void) | null = null;

const currentStock = ref<any>(null);
const currentStockName = computed(() =>
  currentStock.value ? currentStock.value.name : "Loading...",
);
const currentStockSymbol = computed(() =>
  currentStock.value ? currentStock.value.symbol : "---",
);

// Data
const timeframeOptions = computed(() => [
  { label: "日线", value: "daily" },
  { label: "周线", value: "weekly" },
  { label: "月线", value: "monthly" },
]);

const chartTypeOptions = computed(() => [
  { label: t("training.settings.candleSolid"), value: "candle_solid" },
  { label: t("training.settings.candleStroke"), value: "candle_stroke" },
  { label: t("training.settings.candleUpStroke"), value: "candle_up_stroke" },
  {
    label: t("training.settings.candleDownStroke"),
    value: "candle_down_stroke",
  },
  { label: t("training.settings.ohlc"), value: "ohlc" },
  { label: t("training.settings.area"), value: "area" },
]);

const indicatorOptions = [
  { label: "MA", key: "MA" },
  { label: "EMA", key: "EMA" },
  { label: "BOLL", key: "BOLL" },
  { label: "SAR", key: "SAR" },
  { label: "VOL", key: "VOL" },
  { label: "MACD", key: "MACD" },
  { label: "KDJ", key: "KDJ" },
  { label: "RSI", key: "RSI" },
  { label: "BIAS", key: "BIAS" },
  { label: "BRAR", key: "BRAR" },
  { label: "CCI", key: "CCI" },
  { label: "DMI", key: "DMI" },
  { label: "CR", key: "CR" },
  { label: "PSY", key: "PSY" },
  { label: "DMA", key: "DMA" },
  { label: "TRIX", key: "TRIX" },
  { label: "OBV", key: "OBV" },
  { label: "VR", key: "VR" },
  { label: "WR", key: "WR" },
  { label: "MTM", key: "MTM" },
];

const drawingTools = computed(() => [
  {
    group: "Lines",
    items: [
      {
        label: t("training.drawing.trendLine"),
        key: "trendLine",
        icon: AnalyticsOutline,
      },
      {
        label: t("training.drawing.rayLine"),
        key: "rayLine",
        icon: ArrowForwardOutline,
      },
      {
        label: t("training.drawing.horizontalLine"),
        key: "priceLine",
        icon: CreateOutline,
      },
      {
        label: t("training.drawing.verticalLine"),
        key: "verticalRayLine",
        icon: ResizeOutline,
      },
    ],
  },
  {
    group: "Shapes",
    items: [
      {
        label: t("training.drawing.brush"),
        key: "brush",
        icon: BrushOutline,
      },
      {
        label: t("training.drawing.rectangle"),
        key: "rectangle",
        icon: ResizeOutline,
      },
      {
        label: t("training.drawing.circle"),
        key: "circle",
        icon: RadioButtonOffOutline,
      },
    ],
  },
  {
    group: "Fibs",
    items: [
      {
        label: t("training.drawing.fibonacci"),
        key: "fibonacciLine",
        icon: ScanOutline,
      },
    ],
  },
  {
    group: "Text",
    items: [
      { label: t("training.drawing.text"), key: "text", icon: TextOutline },
    ],
  },
]);

const orderTypeOptions = computed(() => [
  { label: t("training.trade.marketOrder"), value: "MARKET" },
  { label: t("training.trade.limitOrder"), value: "LIMIT" },
]);

const position = ref<any>(null);

const tradeHistory = ref([
  {
    id: 1,
    time: "10:45:22",
    type: "BUY",
    price: 150.4,
    amount: 200,
    total: 30080.0,
    status: "FILLED",
  },
]);

const historyColumns = computed(() => [
  { title: t("training.history.time"), key: "time" },
  {
    title: t("training.history.type"),
    key: "type",
    render(row: any) {
      return h(
        NTag,
        {
          type: row.type === "BUY" ? "success" : "error",
          size: "tiny",
          bordered: false,
        },
        { default: () => row.type },
      );
    },
  },
  {
    title: t("training.history.price"),
    key: "price",
    render: (row: any) => `$${row.price}`,
  },
  { title: t("training.history.amount"), key: "amount" },
  {
    title: t("training.history.total"),
    key: "total",
    render: (row: any) => `$${row.total.toLocaleString()}`,
  },
  {
    title: t("training.history.status"),
    key: "status",
    render: (row: any) =>
      h(NTag, { size: "tiny", ghost: true }, { default: () => row.status }),
  },
]);

// Mock Data Generator
// Moved to src/utils/mockData.ts

const fullData = ref<KLineData[]>([]);
const dailyData = ref<KLineData[]>([]);
const weeklyData = ref<KLineData[]>([]);
const monthlyData = ref<KLineData[]>([]);

const currentIndex = ref(0);
const initialDataRef = ref<KLineData[]>([]);

const currentDate = ref<number | null>(null);
const trainingStartIndex = ref(0);
const trainingEndIndex = ref(0);
const trainingStartOverlayId = ref<string | null>(null);
const trainingEndOverlayId = ref<string | null>(null);
const trainingStartTextOverlayId = ref<string | null>(null);
const trainingEndTextOverlayId = ref<string | null>(null);

const remainingTrainingBars = computed(() =>
  Math.max(0, trainingEndIndex.value - currentIndex.value + 1),
);
const isTrainingWindowEnded = computed(
  () => currentIndex.value > trainingEndIndex.value,
);
const isDailyTrainingMode = computed(() => currentTimeframe.value === "daily");
const trainingStartDateText = computed(() => {
  const data = dailyData.value[trainingStartIndex.value];
  return data ? formatDate(data.timestamp) : "--";
});
const trainingEndDateText = computed(() => {
  const data = dailyData.value[trainingEndIndex.value];
  return data ? formatDate(data.timestamp) : "--";
});

function formatDate(timestamp: number) {
  return new Date(timestamp).toISOString().slice(0, 10);
}

function removeTrainingBoundaryOverlays() {
  if (!chartInstance.value) return;
  if (trainingStartOverlayId.value) {
    chartInstance.value.removeOverlay({ id: trainingStartOverlayId.value });
  }
  if (trainingEndOverlayId.value) {
    chartInstance.value.removeOverlay({ id: trainingEndOverlayId.value });
  }
  if (trainingStartTextOverlayId.value) {
    chartInstance.value.removeOverlay({ id: trainingStartTextOverlayId.value });
  }
  if (trainingEndTextOverlayId.value) {
    chartInstance.value.removeOverlay({ id: trainingEndTextOverlayId.value });
  }
  trainingStartOverlayId.value = null;
  trainingEndOverlayId.value = null;
  trainingStartTextOverlayId.value = null;
  trainingEndTextOverlayId.value = null;
}

function syncTrainingBoundaryOverlays() {
  if (!chartInstance.value || dailyData.value.length === 0) return;
  const startData = dailyData.value[trainingStartIndex.value];
  const endData = dailyData.value[trainingEndIndex.value];
  if (!startData || !endData) return;

  removeTrainingBoundaryOverlays();

  const startLineId = chartInstance.value.createOverlay({
    name: "verticalRayLine",
    points: [{ timestamp: startData.timestamp, value: startData.close }],
  }) as string;
  const endLineId = chartInstance.value.createOverlay({
    name: "verticalRayLine",
    points: [{ timestamp: endData.timestamp, value: endData.close }],
  }) as string;

  const startTextId = chartInstance.value.createOverlay({
    name: "text",
    extendData: { text: "训练开始" },
    points: [{ timestamp: startData.timestamp, value: startData.high }],
  }) as string;
  const endTextId = chartInstance.value.createOverlay({
    name: "text",
    extendData: { text: "训练结束" },
    points: [{ timestamp: endData.timestamp, value: endData.high }],
  }) as string;

  trainingStartOverlayId.value = startLineId;
  trainingEndOverlayId.value = endLineId;
  trainingStartTextOverlayId.value = startTextId;
  trainingEndTextOverlayId.value = endTextId;
}

// Clears indicators before adding new ones
function clearIndicators() {
  if (!chartInstance.value) return;
  // klinecharts v9/v10 removeIndicator with no args might not clear all?
  // But based on our setup, we track active indicators in `indicators` ref.
  // We can just iterate and remove.
  // Actually, let's remove ALL indicators by clearing the pane or using API if available.
  // Safe way: remove what we added.
  const allIndicators = [
    "MA",
    "EMA",
    "BOLL",
    "SAR",
    "VOL",
    "MACD",
    "KDJ",
    "RSI",
    "BIAS",
    "BRAR",
    "CCI",
    "DMI",
    "CR",
    "PSY",
    "DMA",
    "TRIX",
    "OBV",
    "VR",
    "WR",
    "MTM",
  ];
  allIndicators.forEach((name) => {
    chartInstance.value?.removeIndicator({ name });
    chartInstance.value?.removeIndicator({ name, paneId: "candle_pane" });
  });
}

async function loadDataForCurrentStock(period: string): Promise<boolean> {
  if (!currentStock.value) return false;

  if (period === "daily" && dailyData.value.length > 0 && currentDate.value) {
    updateChartForDate(currentDate.value);
    return true;
  }
  if (period === "weekly" && weeklyData.value.length > 0 && currentDate.value) {
    updateChartForDate(currentDate.value);
    return true;
  }
  if (
    period === "monthly" &&
    monthlyData.value.length > 0 &&
    currentDate.value
  ) {
    updateChartForDate(currentDate.value);
    return true;
  }

  return false;
}

function updateChartForDate(timestamp: number) {
  if (!chartInstance.value) return;

  let sourceData: KLineData[] = [];
  if (currentTimeframe.value === "daily") sourceData = dailyData.value;
  else if (currentTimeframe.value === "weekly") sourceData = weeklyData.value;
  else if (currentTimeframe.value === "monthly") sourceData = monthlyData.value;

  const endIndex = sourceData.findIndex((d) => d.timestamp > timestamp);
  const sliceEnd = endIndex === -1 ? sourceData.length : endIndex;

  const dataToShow = sourceData.slice(0, sliceEnd);

  if (dataToShow.length === 0) return;

  initialDataRef.value = dataToShow;
  chartInstance.value.resetData();
  setupDataLoader();
  syncTrainingBoundaryOverlays();

  if (currentTimeframe.value === "daily") {
    currentIndex.value = sliceEnd - 1;
  }

  currentPrice.value = dataToShow[dataToShow.length - 1].close;
}

async function startNewRandomTraining(retries = 20) {
  if (retries <= 0) {
    message.error("Failed to find stock data after multiple attempts");
    isChartLoaded.value = true;
    return;
  }

  isChartLoaded.value = false;

  // Random offset to pick a stock from ~5000 total stocks
  const randomOffset = Math.floor(Math.random() * 5000);

  const { data: stocks, error: stockErr } = await supabase
    .from("stock_info")
    .select("ts_code, name, symbol")
    .range(randomOffset, randomOffset)
    .limit(1);

  if (stockErr || !stocks || stocks.length === 0) {
    await startNewRandomTraining(retries - 1);
    return;
  }

  const randomStock = stocks[0];
  currentStock.value = randomStock;

  const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
    supabase
      .from("stock_kline")
      .select("*")
      .eq("ts_code", randomStock.symbol)
      .eq("period", "daily")
      .order("trade_date", { ascending: true }),
    supabase
      .from("stock_kline")
      .select("*")
      .eq("ts_code", randomStock.symbol)
      .eq("period", "weekly")
      .order("trade_date", { ascending: true }),
    supabase
      .from("stock_kline")
      .select("*")
      .eq("ts_code", randomStock.symbol)
      .eq("period", "monthly")
      .order("trade_date", { ascending: true }),
  ]);

  if (
    dailyRes.error ||
    weeklyRes.error ||
    monthlyRes.error ||
    !dailyRes.data?.length
  ) {
    await startNewRandomTraining(retries - 1);
    return;
  }

  // Format Data
  const format = (data: any[]) =>
    data.map((k) => ({
      timestamp: new Date(k.trade_date).getTime(),
      open: Number(k.open),
      high: Number(k.high),
      low: Number(k.low),
      close: Number(k.close),
      volume: Number(k.volume),
      turnover: Number(k.amount),
    }));

  dailyData.value = format(dailyRes.data);
  weeklyData.value = format(weeklyRes.data);
  monthlyData.value = format(monthlyRes.data);
  const minSegmentLength = 50;
  const maxSegmentLength = 150;
  if (dailyData.value.length < minSegmentLength + 1) {
    await startNewRandomTraining(retries - 1);
    return;
  }

  const segmentLength =
    Math.floor(Math.random() * (maxSegmentLength - minSegmentLength + 1)) +
    minSegmentLength;
  const safeSegmentLength = Math.min(segmentLength, dailyData.value.length - 1);
  const maxStartIndex = dailyData.value.length - safeSegmentLength - 1;
  const startIndex = Math.floor(Math.random() * (maxStartIndex + 1));
  const endIndex = startIndex + safeSegmentLength;

  trainingStartIndex.value = startIndex;
  trainingEndIndex.value = endIndex;
  fullData.value = dailyData.value;
  initialDataRef.value = dailyData.value.slice(0, trainingStartIndex.value + 1);
  currentIndex.value = trainingStartIndex.value;
  currentDate.value = dailyData.value[trainingStartIndex.value].timestamp;
  currentPrice.value = dailyData.value[trainingStartIndex.value].close;

  // Reset Chart
  if (chartInstance.value) {
    clearIndicators(); // Fix duplicate indicators!
    chartInstance.value.resetData(); // Use resetData instead of clearData
    setupDataLoader();
    setupIndicatorsFromState();
    chartInstance.value.setSymbol({
      ticker: currentStock.value.symbol,
      pricePrecision: 2,
      volumePrecision: 0,
    });

    // Set initial timeframe
    currentTimeframe.value = "daily";
    let klinePeriod: Period = { type: "day", span: 1 };
    chartInstance.value.setPeriod(klinePeriod);

    // Apply data up to current date
    updateChartForDate(currentDate.value!);
    syncTrainingBoundaryOverlays();

    await ensureChartSized();
  }
  isChartLoaded.value = true;
}

watch(
  () => isTrainingStarted.value,
  () => {
    ensureChartSized();
  },
);

function applyBaseStyles() {
  if (!chartInstance.value) return;

  chartInstance.value.setStyles({
    grid: {
      horizontal: { style: "dashed", color: "#334155" },
      vertical: { style: "dashed", color: "#334155" },
    },
    candle: {
      bar: {
        upColor: "#10B981",
        downColor: "#EF4444",
        noChangeColor: "#888888",
      },
      priceMark: {
        high: { color: "#D1D5DB" },
        low: { color: "#D1D5DB" },
        last: {
          upColor: "#10B981",
          downColor: "#EF4444",
          noChangeColor: "#888888",
          line: { style: "dashed" },
        },
      },
      tooltip: {
        showRule: "always",
        showType: "standard",
      },
      type: currentChartType.value,
    },
    xAxis: {
      tickText: { color: "#94A3B8" },
    },
    yAxis: {
      tickText: { color: "#94A3B8" },
    },
    crosshair: {
      horizontal: {
        line: { style: "dashed" },
        text: { backgroundColor: "#64748B" },
      },
      vertical: {
        line: { style: "dashed" },
        text: { backgroundColor: "#64748B" },
      },
    },
  });
}

function setupDataLoader() {
  if (!chartInstance.value) return;

  chartInstance.value.setDataLoader({
    getBars: (params) => {
      if (params.type === "init") {
        params.callback(initialDataRef.value);
      } else {
        params.callback([]);
      }
    },
    subscribeBar: (params) => {
      updateDataCallback = params.callback;
    },
  });
}

function setupIndicatorsFromState() {
  if (!chartInstance.value) return;
  const mainIndicators = ["MA", "EMA", "BOLL", "SAR"];

  indicators.value.forEach((name) => {
    if (mainIndicators.includes(name)) {
      chartInstance.value?.createIndicator(name, false, { id: "candle_pane" });
    } else {
      chartInstance.value?.createIndicator(name);
    }
  });
}

async function ensureChartSized() {
  await nextTick();

  if (!chartInstance.value || !chartRef.value) return;

  const delays = isTrainingStarted.value
    ? [0, 100, 250, 400, 700]
    : [0, 100, 250];
  for (const delay of delays) {
    await new Promise((r) => setTimeout(r, delay));
    chartInstance.value?.resize();
  }

  const size = chartInstance.value.getSize() as any;
  const width = size?.width ?? 0;
  const height = size?.height ?? 0;
  if (width > 10 && height > 10) return;

  dispose(chartInstance.value);
  chartInstance.value = init(chartRef.value);
  applyBaseStyles();
  if (initialDataRef.value.length > 0) {
    setupDataLoader();
    setupIndicatorsFromState();
    syncTrainingBoundaryOverlays();
  }
}

// Chart Logic
onMounted(() => {
  // Listen for keyboard shortcuts
  window.addEventListener("keydown", handleKeydown);

  // Register custom shapes manually to ensure they work in v10 beta
  registerOverlay({
    name: "rectangle",
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        return [
          {
            type: "rect",
            attrs: {
              x: Math.min(coordinates[0].x, coordinates[1].x),
              y: Math.min(coordinates[0].y, coordinates[1].y),
              width: Math.abs(coordinates[0].x - coordinates[1].x),
              height: Math.abs(coordinates[0].y - coordinates[1].y),
            },
            styles: { style: "stroke_fill" },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "circle",
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        const xDis = Math.abs(coordinates[0].x - coordinates[1].x);
        const yDis = Math.abs(coordinates[0].y - coordinates[1].y);
        const radius = Math.sqrt(xDis * xDis + yDis * yDis);
        return [
          {
            type: "circle",
            attrs: {
              x: coordinates[0].x,
              y: coordinates[0].y,
              r: radius,
            },
            styles: { style: "stroke_fill" },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "trendLine",
    totalStep: 3,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 1) {
        return [
          {
            type: "line",
            attrs: {
              coordinates: coordinates,
            },
            styles: { style: "solid" },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "priceLine",
    totalStep: 2,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding }) => {
      const { width } = bounding;
      if (coordinates.length > 0) {
        return [
          {
            type: "line",
            attrs: {
              coordinates: [
                { x: 0, y: coordinates[0].y },
                { x: width, y: coordinates[0].y },
              ],
            },
            styles: { style: "solid" },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "verticalRayLine",
    totalStep: 2,
    needDefaultPointFigure: true,
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates, bounding }) => {
      const { height } = bounding;
      if (coordinates.length > 0) {
        return [
          {
            type: "line",
            attrs: {
              coordinates: [
                { x: coordinates[0].x, y: 0 },
                { x: coordinates[0].x, y: height },
              ],
            },
            styles: { style: "solid" },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "brush",
    totalStep: 9999,
    needDefaultPointFigure: true, // Enable points to see where we clicked
    needDefaultXAxisFigure: true,
    needDefaultYAxisFigure: true,
    createPointFigures: ({ coordinates }) => {
      // Always return a line connecting all available coordinates
      if (coordinates.length > 1) {
        return [
          {
            type: "line",
            attrs: { coordinates },
            styles: { style: "solid", size: 2 },
          },
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "tradeMarker",
    totalStep: 1,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates, overlay }) => {
      const extendData = overlay.extendData as any;
      const type = extendData?.type ?? "BUY";
      if (coordinates.length > 0) {
        const x = coordinates[0].x;
        const y = coordinates[0].y;

        // Up arrow for BUY, Down arrow for SELL
        const isBuy = type === "BUY";
        const color = isBuy ? "#10B981" : "#EF4444";
        const text = isBuy ? "B" : "S";

        // Triangle points
        // BUY: Arrow Up
        // SELL: Arrow Down
        const size = 8;
        const arrowPoints = isBuy
          ? [
              { x: x, y: y + 20 },
              { x: x - size, y: y + 20 + size * 1.5 },
              { x: x + size, y: y + 20 + size * 1.5 },
            ]
          : [
              { x: x, y: y - 20 },
              { x: x - size, y: y - 20 - size * 1.5 },
              { x: x + size, y: y - 20 - size * 1.5 },
            ];

        return [
          {
            type: "polygon",
            attrs: {
              coordinates: arrowPoints,
            },
            styles: { style: "fill", color: color },
            ignoreEvent: true,
          },
          {
            type: "text",
            attrs: {
              x: x,
              y: isBuy ? y + 40 : y - 40,
              text: text,
              baseline: isBuy ? "top" : "bottom",
              align: "center",
            },
            styles: {
              color: "#FFFFFF",
              backgroundColor: color,
              paddingLeft: 4,
              paddingRight: 4,
              paddingTop: 2,
              paddingBottom: 2,
              borderRadius: 2,
              size: 10,
            },
            ignoreEvent: true,
          },
          // Line connecting to price? Optional.
          // Let's keep it simple first.
        ];
      }
      return [];
    },
  });

  registerOverlay({
    name: "text",
    totalStep: 1,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates, overlay }) => {
      const text = (overlay.extendData as any)?.text || "";
      if (coordinates.length > 0 && text) {
        return [
          {
            type: "text",
            attrs: {
              x: coordinates[0].x,
              y: coordinates[0].y,
              text: text,
            },
            styles: {
              color: isDark.value ? "#FFFFFF" : "#000000",
              size: 14,
            },
          },
        ];
      }
      return [];
    },
  });

  isMounted.value = true;
  if (!chartRef.value) {
    console.error("Chart container not found");
    return;
  }

  chartInstance.value = init(chartRef.value);
  if (chartInstance.value) {
    // Setup resize handler
    resizeHandler = () => {
      chartInstance.value?.resize();
    };
    window.addEventListener("resize", resizeHandler);

    applyBaseStyles();

    // Watch theme changes
    watch(
      [isDark, candleColorMode],
      ([dark, colorMode]) => {
        const gridColor = dark ? "#334155" : "#E2E8F0";
        const textColor = dark ? "#94A3B8" : "#475569";

        // Define colors based on mode
        const isChinese = colorMode === "chinese";
        const upColor = isChinese ? "#EF4444" : "#22C55E"; // CN: Red Up, Intl: Green Up
        const downColor = isChinese ? "#22C55E" : "#EF4444"; // CN: Green Down, Intl: Red Down

        chartInstance.value?.setStyles({
          grid: {
            horizontal: { color: gridColor },
            vertical: { color: gridColor },
          },
          candle: {
            tooltip: {
              text: { color: textColor },
            } as any,
            bar: {
              upColor: upColor,
              downColor: downColor,
              noChangeColor: textColor,
              upBorderColor: upColor,
              downBorderColor: downColor,
              noChangeBorderColor: textColor,
              upWickColor: upColor,
              downWickColor: downColor,
              noChangeWickColor: textColor,
            },
          },
          xAxis: { tickText: { color: textColor } },
          yAxis: { tickText: { color: textColor } },
        });
      },
      { immediate: true },
    );

    // Initial resize to ensure correct rendering
    chartInstance.value.resize();

    // Start training mode with random stock
    setTimeout(() => {
      if (!isMounted.value) return;
      startNewRandomTraining();
    }, 500);

    // Handle resize
    // Removed duplicate listener logic
  }
});

onUnmounted(() => {
  isMounted.value = false;
  if (isTrainingStarted.value) {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
    }
    setFullscreen(false);
  }
  stopPlay();

  if (resizeHandler) {
    window.removeEventListener("resize", resizeHandler);
    resizeHandler = null;
  }

  window.removeEventListener("keydown", handleKeydown);

  if (chartInstance.value) {
    dispose(chartInstance.value);
    chartInstance.value = null;
  }
});

function handleKeydown(e: KeyboardEvent) {
  if (!isTrainingStarted.value) return;

  // Ignore shortcuts if user is typing in an input (though we don't have many inputs in full screen)
  if (
    e.target instanceof HTMLInputElement ||
    e.target instanceof HTMLTextAreaElement
  )
    return;

  const key = e.key.toLowerCase();

  // Toggle Quick Trade panel with 'T' key
  if (key === "t" && !e.ctrlKey && !e.metaKey && !e.altKey) {
    showQuickTrade.value = !showQuickTrade.value;
    return;
  }

  // Playback Control: Space
  if (key === " " && isDailyTrainingMode.value) {
    e.preventDefault(); // Prevent page scroll
    togglePlay();
    return;
  }

  // Step Forward: ArrowRight
  if (e.key === "ArrowRight" && isDailyTrainingMode.value) {
    e.preventDefault();
    stepForward();
    return;
  }

  // Buy/Long: 'B'
  if (key === "b" && showQuickTrade.value) {
    handleTrade("BUY");
    return;
  }

  // Sell/Short: 'S'
  if (key === "s" && showQuickTrade.value) {
    handleTrade("SELL");
    return;
  }

  // Close Position: 'C' or 'Escape'
  if (
    (key === "c" || key === "escape") &&
    position.value &&
    showQuickTrade.value
  ) {
    closePosition();
    return;
  }

  // Drawing Tools Shortcuts
  // L: Trend Line
  if (key === "l") {
    setDrawingTool("trendLine");
    return;
  }
  // H: Horizontal Line
  if (key === "h") {
    setDrawingTool("priceLine");
    return;
  }
  // V: Vertical Line
  if (key === "v") {
    setDrawingTool("verticalRayLine");
    return;
  }
  // F: Fibonacci
  if (key === "f") {
    setDrawingTool("fibonacciLine");
    return;
  }
  // R: Rectangle
  if (key === "r") {
    setDrawingTool("rectangle");
    return;
  }
  // P: Brush (Pen)
  if (key === "p") {
    setDrawingTool("brush");
    return;
  }
  // O: Circle
  if (key === "o") {
    setDrawingTool("circle");
    return;
  }
  // D: Delete/Clear Drawings (Shift+D to clear all)
  if (key === "d" && e.shiftKey) {
    clearDrawings();
    return;
  }
}

function updateChart() {
  if (!chartInstance.value || currentIndex.value >= fullData.value.length)
    return;

  const newData = fullData.value[currentIndex.value];
  if (updateDataCallback) {
    updateDataCallback(newData);
  }
  currentDate.value = newData.timestamp;
  currentPrice.value = newData.close;

  // Update position P/L if active
  if (position.value) {
    const diff = currentPrice.value - position.value.entryPrice;
    const plPerShare = position.value.side === "LONG" ? diff : -diff;
    position.value.plAmount = plPerShare * position.value.amount;
    position.value.pl =
      (position.value.plAmount /
        (position.value.entryPrice * position.value.amount)) *
      100;
    position.value.pl = Number(position.value.pl.toFixed(2));
  }
}

// Actions
async function handleTimeframeChange(value: string) {
  const option = timeframeOptions.value.find((o) => o.value === value);
  if (!option) return;

  currentTimeframe.value = option.value;
  if (!isDailyTrainingMode.value) {
    stopPlay();
  }


  if (!chartInstance.value) return;

  let period: Period = { type: "day", span: 1 };
  if (value === "weekly") period = { type: "week", span: 1 };
  if (value === "monthly") period = { type: "month", span: 1 };
  chartInstance.value.setPeriod(period);
  await loadDataForCurrentStock(value);
  syncTrainingBoundaryOverlays();
}

function startPlay() {
  if (!isDailyTrainingMode.value) {
    message.warning("仅日线模式支持播放与步进");
    return;
  }
  if (currentIndex.value >= fullData.value.length) return;
  isPlaying.value = true;
  const interval = 1000 / playSpeed.value;
  playInterval = setInterval(() => {
    currentIndex.value++;
    updateChart();
    if (currentIndex.value >= fullData.value.length - 1) {
      stopPlay();
    }
  }, interval);
}

function stopPlay() {
  isPlaying.value = false;
  if (playInterval) {
    clearInterval(playInterval);
    playInterval = null;
  }
}

function togglePlay() {
  if (!isDailyTrainingMode.value) {
    message.warning("仅日线模式支持播放与步进");
    return;
  }
  if (isPlaying.value) {
    stopPlay();
    message.info(t("training.messages.playbackPaused"));
  } else {
    startPlay();
    message.success(t("training.messages.playbackStarted"));
  }
}

function stepForward() {
  if (!isDailyTrainingMode.value) {
    message.warning("仅日线模式支持播放与步进");
    return;
  }
  if (currentIndex.value < fullData.value.length - 1) {
    currentIndex.value++;
    updateChart();
  }
}

function stepBackward() {
  message.warning(t("training.messages.cannotStepBackward"));
}

function toggleIndicator(name: string) {
  if (!chartInstance.value) return;

  const mainIndicators = ["MA", "EMA", "BOLL", "SAR"];
  const subIndicators = [
    "VOL",
    "MACD",
    "KDJ",
    "RSI",
    "BIAS",
    "BRAR",
    "CCI",
    "DMI",
    "CR",
    "PSY",
    "DMA",
    "TRIX",
    "OBV",
    "VR",
    "WR",
    "MTM",
  ];

  // 1. Remove if exists
  if (indicators.value.includes(name)) {
    indicators.value = indicators.value.filter((i) => i !== name);
    // Remove from main pane or sub pane
    chartInstance.value.removeIndicator({ paneId: "candle_pane", name: name });
    chartInstance.value.removeIndicator({ name: name });
    return;
  }

  // 2. Add
  if (mainIndicators.includes(name)) {
    // Optimization: Mutual exclusion for Main indicators (cleaner chart)
    const currentMain = indicators.value.find((i) =>
      mainIndicators.includes(i),
    );
    if (currentMain) {
      indicators.value = indicators.value.filter((i) => i !== currentMain);
      chartInstance.value.removeIndicator({
        paneId: "candle_pane",
        name: currentMain,
      });
    }

    indicators.value.push(name);
    chartInstance.value.createIndicator(name, false, { id: "candle_pane" });
  } else {
    // Sub indicators
    // Optimization: Limit to 3 sub indicators to prevent layout squashing
    const currentSubs = indicators.value.filter((i) =>
      subIndicators.includes(i),
    );
    if (currentSubs.length >= 3) {
      const toRemove = currentSubs[0];
      indicators.value = indicators.value.filter((i) => i !== toRemove);
      chartInstance.value.removeIndicator({ name: toRemove });
    }

    indicators.value.push(name);
    chartInstance.value.createIndicator(name);
  }
}

function handleChartTypeChange(key: CandleType) {
  currentChartType.value = key;
  if (chartInstance.value) {
    chartInstance.value.setStyles({
      candle: {
        type: key,
      },
    });
  }
}

function setDrawingTool(name: string) {
  if (!chartInstance.value) return;

  // Special handling for cursor
  if (name === "cursor") {
    currentDrawingTool.value = null;

    // Sync settings
    chartSettings.value.crosshair = true;

    chartInstance.value.setStyles({
      crosshair: {
        show: true,
        horizontal: {
          show: true,
          line: { style: "dashed" },
          text: { show: true },
        },
        vertical: {
          show: true,
          line: { style: "dashed" },
          text: { show: true },
        },
      },
    });
    message.info(t("training.messages.cursorCrosshair"));
    return;
  }

  if (currentDrawingTool.value === name && !isDrawingLocked.value) {
    // Deselect if not locked
    currentDrawingTool.value = null;
    // Re-enable scroll when tool is deselected
    if (chartInstance.value) {
      chartInstance.value.setScrollEnabled(true);
      chartInstance.value.setZoomEnabled(true);
    }
    return;
  }

  currentDrawingTool.value = name;

  // Disable scroll AND zoom when a drawing tool is active to prevent conflict
  if (chartInstance.value) {
    chartInstance.value.setScrollEnabled(false);
    chartInstance.value.setZoomEnabled(false);
  }

  const overlayParams: OverlayCreate = {
    name: name,
    groupId: "drawing",
    lock: false,
    mode: "normal",
    styles: {},
    onDrawEnd: (event: any) => {
      if (name === "text") {
        const overlay = event.overlay;
        if (overlay) {
          pendingTextOverlay.value = overlay;
          editingText.value = "";
          showTextModal.value = true;
        }
      }

      if (isDrawingLocked.value) {
        setTimeout(() => {
          if (currentDrawingTool.value === name && chartInstance.value) {
            chartInstance.value.createOverlay(overlayParams);
          }
        }, 50);
      } else {
        // If it's a brush, we might want to keep it active?
        // But for now standard behavior
        currentDrawingTool.value = null;
        // Re-enable scroll and zoom when drawing ends (and not locked)
        if (chartInstance.value) {
          chartInstance.value.setScrollEnabled(true);
          chartInstance.value.setZoomEnabled(true);
        }
      }
    },
  };

  if (isMagnetMode.value && name !== "brush") {
    overlayParams.mode = "weak_magnet";
  }

  // Ensure chart is ready
  if (chartInstance.value) {
    // Create overlay returns an ID string or array of strings.
    // We don't need to store it unless we want to modify this specific overlay later.
    chartInstance.value.createOverlay(overlayParams);
  }
}

function clearDrawings() {
  if (!chartInstance.value) return;
  chartInstance.value.removeOverlay();
}

function takeScreenshot() {
  if (!chartInstance.value) return;
  const url = chartInstance.value.getConvertPictureUrl(true, "png");
  const a = document.createElement("a");
  a.href = url;
  a.download = `chart_screenshot_${Date.now()}.png`;
  a.click();
  message.success(t("training.messages.screenshotSaved"));
}

function saveLayout() {
  if (!chartInstance.value) return;
  // In a real app, we would serialize chart state (indicators, drawings, etc.)
  // For now, we simulate saving user preferences
  localStorage.setItem("stonks_training_timeframe", currentTimeframe.value);
  localStorage.setItem("stonks_training_chart_type", currentChartType.value);
  localStorage.setItem(
    "stonks_training_indicators",
    JSON.stringify(indicators.value),
  );
  message.success(t("training.messages.layoutSaved"));
}

const showSettings = ref(false);
const chartSettings = ref({
  grid: true,
  crosshair: true,
  tooltip: true,
  yAxisRight: true,
});

function showChartSettings() {
  showSettings.value = true;
}

function updateChartSettings() {
  if (!chartInstance.value) return;

  const styles: any = {
    grid: {
      show: chartSettings.value.grid,
    },
    crosshair: {
      show: chartSettings.value.crosshair,
      horizontal: {
        show: chartSettings.value.crosshair,
        line: { show: chartSettings.value.crosshair },
        text: { show: chartSettings.value.crosshair },
      },
      vertical: {
        show: chartSettings.value.crosshair,
        line: { show: chartSettings.value.crosshair },
        text: { show: chartSettings.value.crosshair },
      },
    },
    candle: {
      tooltip: {
        showRule: chartSettings.value.tooltip ? "always" : "none",
        showType: "standard",
      },
    },
  };

  chartInstance.value.setStyles(styles);
}

function setAmountByPercent(p: number) {
  tradeAmount.value =
    Math.floor((125430 * (p / 100)) / currentPrice.value / 100) * 100;
}

function handleTrade(side: string) {
  if (isTrainingWindowEnded.value) {
    message.warning("训练结束后仅可查看后续K线，不能交易");
    return;
  }

  if (position.value) {
    message.error(
      t("training.messages.alreadyHavePosition", { side: position.value.side }),
    );
    return;
  }

  const total = currentPrice.value * tradeAmount.value;
  position.value = {
    side: side === "BUY" ? "LONG" : "SHORT",
    amount: tradeAmount.value,
    entryPrice: currentPrice.value,
    entryTime: fullData.value[currentIndex.value].timestamp, // Record entry time for T+1 check
    pl: 0,
    plAmount: 0,
  };

  tradeHistory.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    type: side,
    price: currentPrice.value,
    amount: tradeAmount.value,
    total: total,
    status: "FILLED",
  });

  // Add marker to chart
  if (chartInstance.value) {
    const timestamp = fullData.value[currentIndex.value].timestamp;
    chartInstance.value.createOverlay({
      name: "tradeMarker",
      extendData: { type: side, price: currentPrice.value },
      points: [{ timestamp: timestamp, value: currentPrice.value }],
    });
  }

  message.success(
    t("training.messages.orderFilled", {
      side,
      price: currentPrice.value.toFixed(2),
    }),
  );
}

function closePosition() {
  if (!position.value) return;
  if (isTrainingWindowEnded.value) {
    message.warning("训练结束后仅可查看后续K线，不能交易");
    return;
  }

  // T+1 Rule Check
  // In simulation, we check if the current candle timestamp is greater than entry timestamp
  // Assuming daily candles, next index is next day.
  // For intraday, we might need to check the date part of timestamp.
  // Let's implement a simple check: must be at least next candle for now,
  // or check date difference if timestamps are available.

  const currentTimestamp = fullData.value[currentIndex.value].timestamp;
  const entryTimestamp = position.value.entryTime;

  // Convert timestamps to dates to check if it's the same day
  const currentDate = new Date(currentTimestamp);
  const entryDate = new Date(entryTimestamp);

  const isSameDay =
    currentDate.getFullYear() === entryDate.getFullYear() &&
    currentDate.getMonth() === entryDate.getMonth() &&
    currentDate.getDate() === entryDate.getDate();

  if (isSameDay) {
    message.warning(t("training.messages.tPlusOneWarning"));
    return;
  }

  const side = position.value.side === "LONG" ? "SELL" : "BUY";
  const total = currentPrice.value * position.value.amount;

  tradeHistory.value.unshift({
    id: Date.now(),
    time: new Date().toLocaleTimeString(),
    type: side,
    price: currentPrice.value,
    amount: position.value.amount,
    total: total,
    status: "FILLED",
  });

  // Add marker to chart
  if (chartInstance.value) {
    const timestamp = fullData.value[currentIndex.value].timestamp;
    const type = side === "BUY" ? "BUY" : "SELL"; // Closing SHORT is BUY, Closing LONG is SELL
    chartInstance.value.createOverlay({
      name: "tradeMarker",
      extendData: { type: type, price: currentPrice.value },
      points: [{ timestamp: timestamp, value: currentPrice.value }],
    });
  }

  const pl = position.value.plAmount;
  message.success(t("training.messages.positionClosed", { pl: pl.toFixed(2) }));
  position.value = null;
}

function exitTraining() {
  if (isTrainingStarted.value) {
    stopPlay();
    isTrainingStarted.value = false;
    setFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    message.info(t("training.messages.sessionEnded"));

    // Load a new random stock for the next session
    startNewRandomTraining();
  } else {
    router.push("/");
  }
}

function startTraining() {
  isTrainingStarted.value = true;
  setFullscreen(true);
  document.documentElement.requestFullscreen().catch((err) => {
    console.error("Error attempting to enable fullscreen:", err);
  });
  message.success(t("training.messages.sessionStarted"));
}

function saveText() {
  if (!pendingTextOverlay.value || !chartInstance.value) return;

  const text = editingText.value;
  if (text) {
    chartInstance.value.overrideOverlay({
      id: pendingTextOverlay.value.id,
      extendData: { text: text },
    });
    message.success(t("training.messages.textAdded"));
  } else {
    chartInstance.value.removeOverlay({ id: pendingTextOverlay.value.id });
  }

  showTextModal.value = false;
  pendingTextOverlay.value = null;
  editingText.value = "";
}

function cancelText() {
  if (pendingTextOverlay.value && chartInstance.value) {
    chartInstance.value.removeOverlay({ id: pendingTextOverlay.value.id });
  }
  showTextModal.value = false;
  pendingTextOverlay.value = null;
  editingText.value = "";
}
</script>

<style scoped>
#chart-container {
  width: 100%;
  height: 100%;
}
</style>
