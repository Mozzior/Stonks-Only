<template>
  <div
    class="w-full flex flex-col gap-4 min-h-0"
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
        : {
            height: 'calc(100vh - 3rem)',
          }
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
            >${{
              displayBalance.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            }}</span
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
        class="flex-1 min-h-0 bg-[var(--color-bg-card)] flex flex-col overflow-hidden relative transition-all duration-300"
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
                    ? t("training.toolbar.endedSession")
                    : t("training.toolbar.liveSession")
                }}
              </span>
            </div>
            <div
              v-if="isTrainingStarted"
              class="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-sidebar)] rounded border border-[var(--color-border)]"
            >
              <span class="text-xs text-[var(--color-text-secondary)]">{{
                t("training.toolbar.remainingBars")
              }}</span>
              <span
                class="text-xs font-bold text-[var(--color-brand-primary)]"
                >{{ remainingTrainingBars }}</span
              >
            </div>
            <div
              v-if="isTrainingStarted"
              class="flex items-center gap-2 px-3 py-1 bg-[var(--color-bg-sidebar)] rounded border border-[var(--color-border)]"
            >
              <span class="text-xs text-[var(--color-text-secondary)]">{{
                t("training.toolbar.trainingRange")
              }}</span>
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
          class="absolute top-1/2 left-16 -translate-y-1/2 z-30 flex flex-col gap-2 bg-[var(--color-bg-card)] p-4 rounded-xl border border-[var(--color-border)] shadow-xl w-64"
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

          <div class="flex flex-col gap-2">
            <n-tabs type="segment" v-model:value="tradeSide" size="small">
              <n-tab name="LONG">{{ t("training.trade.long", "做多") }}</n-tab>
              <n-tab name="SHORT">{{
                t("training.trade.short", "做空")
              }}</n-tab>
            </n-tabs>
            <div class="flex flex-col gap-1">
              <span class="text-xs text-[var(--color-text-secondary)]">{{
                t("training.trade.amountShares")
              }}</span>
              <n-input-number
                v-model:value="tradeAmount"
                :min="1"
                :step="1"
                class="w-full"
              />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <n-button size="tiny" ghost @click="setAmountByPercent(25)">{{
                t("training.trade.quarterPosition", "1/4仓")
              }}</n-button>
              <n-button size="tiny" ghost @click="setAmountByPercent(50)">{{
                t("training.trade.halfPosition", "1/2仓")
              }}</n-button>
              <n-button size="tiny" ghost @click="setAmountByPercent(100)">{{
                t("training.trade.fullPosition", "全仓")
              }}</n-button>
            </div>
            <n-button
              :type="tradeSide === 'LONG' ? 'primary' : 'error'"
              class="w-full"
              :disabled="isTrainingWindowEnded"
              :loading="isTrading"
              @click="handleTrade(tradeSide)"
            >
              {{
                tradeSide === "LONG"
                  ? t("training.trade.buyLong", "做多开仓")
                  : t("training.trade.sellShort", "做空开仓")
              }}
            </n-button>
          </div>

          <div
            class="flex items-center justify-between mt-2 pt-2 border-t border-[var(--color-border)]"
          >
            <span class="text-xs text-[var(--color-text-secondary)]"
              >浮动盈亏:</span
            >
            <span
              v-if="tradeStore.positions.value.length > 0"
              :class="
                unrealizedPnl >= 0
                  ? 'text-[var(--color-success)]'
                  : 'text-[var(--color-error)]'
              "
              class="font-bold text-sm"
            >
              {{ unrealizedPnl >= 0 ? "+" : "" }}${{ unrealizedPnl.toFixed(2) }}
            </span>
            <span v-else class="text-xs text-[var(--color-text-secondary)]"
              >None</span
            >
          </div>
          <div
            v-if="positions.filter((p) => p.side === tradeSide).length > 0"
            class="mt-2 space-y-2"
          >
            <div class="text-xs text-[var(--color-text-secondary)]">
              当前持仓 ({{ tradeSide }})
            </div>
            <div
              v-for="pos in positions.filter((p) => p.side === tradeSide)"
              :key="pos.id"
              class="flex flex-col gap-2 text-xs p-2 rounded border border-[var(--color-border)]"
            >
              <div class="flex items-center justify-between">
                <div class="flex items-center gap-2">
                  <n-tag
                    :type="pos.side === 'LONG' ? 'success' : 'error'"
                    size="small"
                    class="font-bold"
                  >
                    {{ pos.side }}
                  </n-tag>
                  <span
                    >{{ pos.amount }} 股 @ ${{
                      pos.entryPrice.toFixed(2)
                    }}</span
                  >
                </div>
                <span
                  :class="
                    (pos.side === 'LONG'
                      ? currentPrice - pos.entryPrice
                      : pos.entryPrice - currentPrice) *
                      pos.amount >=
                    0
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  "
                  class="font-bold"
                >
                  ${{
                    (
                      (pos.side === "LONG"
                        ? currentPrice - pos.entryPrice
                        : pos.entryPrice - currentPrice) * pos.amount
                    ).toFixed(2)
                  }}
                </span>
              </div>
              <div class="w-full">
                <n-button-group
                  size="tiny"
                  class="compact-trade-group flex w-full"
                >
                  <n-button
                    tertiary
                    class="flex-1"
                    @click="handlePartialClose(pos.id, 25)"
                    :disabled="isTrainingWindowEnded"
                    :loading="isTrading"
                    >1/4</n-button
                  >
                  <n-button
                    tertiary
                    class="flex-1"
                    @click="handlePartialClose(pos.id, 50)"
                    :disabled="isTrainingWindowEnded"
                    :loading="isTrading"
                    >1/2</n-button
                  >
                  <n-button
                    tertiary
                    type="warning"
                    class="flex-1"
                    @click="closePosition(pos.id, pos.amount)"
                    :disabled="isTrainingWindowEnded"
                    :loading="isTrading"
                    >全仓</n-button
                  >
                </n-button-group>
              </div>
            </div>
          </div>
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

        <!-- Session Trade Records -->
        <div
          class="flex-none h-48 border-t border-[var(--color-border)] bg-[var(--color-bg-card)] overflow-y-auto"
        >
          <div
            class="p-3 font-bold text-sm border-b border-[var(--color-border)] sticky top-0 bg-[var(--color-bg-card)] z-10 flex justify-between items-center"
          >
            <span>{{ t("training.history.title", "本场交易记录") }}</span>
          </div>
          <n-table
            size="small"
            :bordered="false"
            :single-line="false"
            class="w-full text-xs"
          >
            <thead>
              <tr>
                <th>{{ t("training.history.time", "Time") }}</th>
                <th>{{ t("training.history.action", "Action") }}</th>
                <th>{{ t("training.history.price", "Price") }}</th>
                <th>{{ t("training.history.amount", "Amount") }}</th>
                <th>{{ t("training.history.pl", "P/L") }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in tradeRecords" :key="record.id">
                <td>{{ formatDate(record.time) }}</td>
                <td>
                  <n-tag
                    :type="
                      record.action === 'LONG'
                        ? 'success'
                        : record.action === 'SHORT'
                          ? 'error'
                          : 'warning'
                    "
                    size="small"
                    class="font-bold"
                  >
                    {{
                      record.action === "LONG"
                        ? t("training.trade.long", "做多")
                        : record.action === "SHORT"
                          ? t("training.trade.short", "做空")
                          : t("training.trade.close", "平仓")
                    }}
                  </n-tag>
                </td>
                <td>${{ record.price.toFixed(2) }}</td>
                <td>{{ record.amount }}</td>
                <td>
                  <span
                    v-if="record.realizedPnl !== undefined"
                    :class="
                      record.realizedPnl >= 0
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-error)]'
                    "
                    class="font-bold"
                  >
                    {{ record.realizedPnl >= 0 ? "+" : ""
                    }}{{ record.realizedPnl.toFixed(2) }}
                  </span>
                  <span v-else>-</span>
                </td>
              </tr>
              <tr v-if="tradeRecords.length === 0">
                <td
                  colspan="5"
                  class="text-center text-[var(--color-text-secondary)] py-6 italic"
                >
                  {{ t("training.history.noRecords", "暂无交易记录") }}
                </td>
              </tr>
            </tbody>
          </n-table>
        </div>
      </div>

      <!-- Right: Order Panel & Positions -->
      <div class="w-60 flex flex-col min-h-0 gap-4" v-show="!isTrainingStarted">
        <!-- Order Panel -->
        <n-card
          :title="t('training.trade.executeTrade')"
          :bordered="false"
          class="bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)]"
        >
          <n-tabs type="segment" v-model:value="tradeSide" animated>
            <n-tab name="LONG">{{ t("training.trade.long", "做多") }}</n-tab>
            <n-tab name="SHORT">{{ t("training.trade.short", "做空") }}</n-tab>
          </n-tabs>
          <div class="space-y-4 pt-4">
            <div class="flex flex-col gap-1">
              <span class="text-xs text-[var(--color-text-secondary)]">{{
                t("training.trade.amountShares")
              }}</span>
              <n-input-number
                v-model:value="tradeAmount"
                :min="1"
                :step="1"
                class="w-full"
              />
            </div>
            <div class="grid grid-cols-3 gap-2">
              <n-button size="tiny" ghost @click="setAmountByPercent(25)">{{
                t("training.trade.quarterPosition", "1/4仓")
              }}</n-button>
              <n-button size="tiny" ghost @click="setAmountByPercent(50)">{{
                t("training.trade.halfPosition", "1/2仓")
              }}</n-button>
              <n-button size="tiny" ghost @click="setAmountByPercent(100)">{{
                t("training.trade.fullPosition", "全仓")
              }}</n-button>
            </div>
            <n-button
              :type="tradeSide === 'LONG' ? 'primary' : 'error'"
              block
              size="large"
              class="font-bold mt-4"
              :disabled="isTrainingWindowEnded"
              :loading="isTrading"
              @click="handleTrade(tradeSide)"
            >
              {{
                tradeSide === "LONG"
                  ? t("training.trade.buyLong", "做多开仓")
                  : t("training.trade.sellShort", "做空开仓")
              }}
            </n-button>
          </div>
        </n-card>

        <!-- Current Position -->
        <n-card
          :title="t('training.trade.openPosition')"
          :bordered="false"
          class="flex-1 flex flex-col min-h-0 bg-[var(--color-bg-card)] rounded-xl border border-[var(--color-border)] overflow-hidden"
          content-class="flex-1 overflow-y-auto"
        >
          <div
            v-if="positions.filter((p) => p.side === tradeSide).length > 0"
            class="space-y-4"
          >
            <!-- Global Account Summary -->
            <div
              class="p-3 rounded-lg bg-[var(--color-bg-sidebar)] border border-[var(--color-border)] mb-4"
            >
              <div class="flex justify-between items-center mb-1">
                <span class="text-xs text-[var(--color-text-secondary)]"
                  >总资产 (Equity)</span
                >
                <span class="text-lg font-bold"
                  >${{ sessionEquity.toFixed(2) }}</span
                >
              </div>
              <div
                class="flex justify-between text-[10px] text-[var(--color-text-secondary)]"
              >
                <span>可用资金: ${{ accountBalance.toFixed(2) }}</span>
                <span
                  >浮动盈亏:
                  <span
                    :class="
                      unrealizedPnl >= 0
                        ? 'text-[var(--color-success)]'
                        : 'text-[var(--color-error)]'
                    "
                    >{{ unrealizedPnl >= 0 ? "+" : ""
                    }}{{ unrealizedPnl.toFixed(2) }}</span
                  ></span
                >
              </div>
              <div
                class="flex justify-between text-[10px] text-[var(--color-text-secondary)] mt-1"
              >
                <span>占用保证金: ${{ usedMargin.toFixed(2) }}</span>
              </div>
            </div>

            <!-- Position List -->
            <div
              v-for="pos in positions.filter((p) => p.side === tradeSide)"
              :key="pos.id"
              class="p-3 rounded-lg border border-[var(--color-border)]"
            >
              <div class="flex justify-between items-center mb-2">
                <div class="flex items-center gap-2">
                  <n-tag
                    :type="pos.side === 'LONG' ? 'success' : 'error'"
                    size="small"
                    class="font-bold"
                  >
                    {{ pos.side }}
                  </n-tag>
                  <span class="text-sm font-medium"
                    >{{ pos.amount }} Shares</span
                  >
                </div>
                <span
                  :class="
                    (pos.side === 'LONG'
                      ? currentPrice - pos.entryPrice
                      : pos.entryPrice - currentPrice) *
                      pos.amount >=
                    0
                      ? 'text-[var(--color-success)]'
                      : 'text-[var(--color-error)]'
                  "
                  class="font-bold"
                >
                  ${{
                    (
                      (pos.side === "LONG"
                        ? currentPrice - pos.entryPrice
                        : pos.entryPrice - currentPrice) * pos.amount
                    ).toFixed(2)
                  }}
                </span>
              </div>

              <div
                class="flex justify-between text-xs text-[var(--color-text-secondary)] mb-3"
              >
                <span>开仓: ${{ pos.entryPrice.toFixed(2) }}</span>
                <span>当前: ${{ currentPrice.toFixed(2) }}</span>
              </div>

              <n-button-group size="tiny" class="w-full mt-2">
                <n-button
                  tertiary
                  class="flex-1"
                  @click="handlePartialClose(pos.id, 25)"
                  :disabled="isTrainingWindowEnded"
                  :loading="isTrading"
                  >1/4</n-button
                >
                <n-button
                  tertiary
                  class="flex-1"
                  @click="handlePartialClose(pos.id, 50)"
                  :disabled="isTrainingWindowEnded"
                  :loading="isTrading"
                  >1/2</n-button
                >
                <n-button
                  tertiary
                  type="warning"
                  class="flex-1"
                  @click="closePosition(pos.id, pos.amount)"
                  :disabled="isTrainingWindowEnded"
                  :loading="isTrading"
                  >全仓</n-button
                >
              </n-button-group>

              <div class="flex gap-2 mt-2">
                <n-button
                  size="tiny"
                  type="primary"
                  ghost
                  class="flex-1"
                  @click="reversePosition(pos.id)"
                  :disabled="isTrainingWindowEnded"
                  :loading="isTrading"
                  >一键反手</n-button
                >
              </div>
            </div>
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
  NInputNumber,
  NTag,
  NModal,
  NSpin,
  useMessage,
  NSpace,
  NPopselect,
  NPopover,
  NSwitch,
  NTable,
  NTabs,
  NTab,
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
import {
  init,
  Chart,
  dispose,
  registerOverlay,
  registerLocale,
} from "klinecharts";
import type { KLineData, Period, OverlayCreate, CandleType } from "klinecharts";
import { useTheme } from "../composables/useTheme";
import { useLayoutControl } from "../composables/useLayoutControl";
import { useAuth } from "../composables/useAuth";
import { useTrainingStore } from "../composables/useTrainingStore";
import {
  createTrainingSession,
  executeTrainingOrder,
  settleTrainingSession,
  getTrainingSession,
  listSessions,
  getTrainingTrades,
} from "../services/api/trainingApi";
import {
  fetchRandomStock,
  fetchRandomStockSmart,
  getStockInfoByTsCode,
  getStockInfoBySymbol,
  listStockKlineByAny,
} from "../services/marketRepo";
import { saveSessionProgress } from "../services/api/trainingApi";
import { ID } from "../utils/appwrite";

const router = useRouter();
const message = useMessage();
const { isDark, candleColorMode } = useTheme();
const { setFullscreen } = useLayoutControl();
const { t, locale } = useI18n();
const { user, profile, refreshProfile } = useAuth();

// State
const tradeStore = useTrainingStore();
const {
  positions,
  tradeRecords,
  currentPrice: storePrice,
  equity: sessionEquity,
  usedMargin,
  unrealizedPnl,
} = tradeStore;

const isChartLoaded = ref(false);
const chartRef = ref<HTMLElement | null>(null);
const isPlaying = ref(false);
const isTrainingStarted = ref(false);
const showQuickTrade = ref(false);
const playSpeed = ref(2);
const currentTimeframe = ref("daily");
const currentChartType = ref<CandleType>("candle_solid");
const tradeAmount = ref(100);
const tradeSide = ref<"LONG" | "SHORT">("LONG");
const currentPrice = ref(0);
watch(currentPrice, (v) => {
  storePrice.value = v;
});
const showHelp = ref(false);
const indicators = ref<string[]>(["MA", "VOL"]);
const currentDrawingTool = ref<string | null>(null);
const chartInstance = shallowRef<Chart | null>(null);
let resizeObserver: ResizeObserver | null = null;
const isMounted = ref(true);
const isMagnetMode = ref(false);
const isDrawingLocked = ref(false);
const showTextModal = ref(false);
const editingText = ref("");
const pendingTextOverlay = ref<any>(null);
let playInterval: any = null;
let updateDataCallback: ((data: KLineData) => void) | null = null;
let resizeHandler: (() => void) | null = null;
let progressSaveTimer: any = null;
const activeSessionId = ref<string | null>(null);
const sessionTradeSeq = ref(0);
const sessionInitialBalance = ref(0);
const sessionRealizedPnl = ref(0);
const sessionPeakBalance = ref(0);
const isFetchingLogs = ref(false);
const isTrading = ref(false);
const accountBalance = computed(() =>
  Number(profile.value?.training_balance ?? 0),
);
const displayBalance = computed(() => accountBalance.value);

const currentStock = ref<any>(null);
const currentStockName = computed(() =>
  currentStock.value ? currentStock.value.name : "Loading...",
);
const currentStockSymbol = computed(() =>
  currentStock.value ? currentStock.value.symbol : "---",
);

// Data
const timeframeOptions = computed(() => [
  { label: t("training.timeframeOptions.daily"), value: "daily" },
  { label: t("training.timeframeOptions.weekly"), value: "weekly" },
  { label: t("training.timeframeOptions.monthly"), value: "monthly" },
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

const autoSettled = ref(false);

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

function formatDate(dateInput: number | string) {
  if (!dateInput) return "";
  const d = new Date(dateInput);
  return d.toISOString().slice(0, 10);
}

registerLocale("zh-CN", {
  time: "时间",
  open: "开",
  high: "高",
  low: "低",
  close: "收",
  volume: "成交量",
  change: "涨跌幅",
  turnover: "换手率",
  second: "秒",
  minute: "分",
  hour: "小时",
  day: "日",
  week: "周",
  month: "月",
  year: "年",
});

registerLocale("en-US", {
  time: "Time",
  open: "Open",
  high: "High",
  low: "Low",
  close: "Close",
  volume: "Volume",
  change: "Change",
  turnover: "Turnover",
  second: "Second",
  minute: "Minute",
  hour: "Hour",
  day: "Day",
  week: "Week",
  month: "Month",
  year: "Year",
});

function getChartLocale() {
  return locale.value === "zh-CN" ? "zh-CN" : "en-US";
}

function applyChartLocale() {
  if (!chartInstance.value) return;
  chartInstance.value.setLocale(getChartLocale());
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
    extendData: { text: t("training.messages.trainingBoundaryStart") },
    points: [{ timestamp: startData.timestamp, value: startData.high }],
  }) as string;
  const endTextId = chartInstance.value.createOverlay({
    name: "text",
    extendData: { text: t("training.messages.trainingBoundaryEnd") },
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
  activeSessionId.value = null;
  sessionTradeSeq.value = 0;
  if (retries <= 0) {
    message.error(
      t("training.messages.sessionNotInitialized") ||
        "Failed to load K-Line data",
    );
    isChartLoaded.value = true;
    return;
  }

  isChartLoaded.value = false;

  let stockResult = await fetchRandomStockSmart();
  if (stockResult.error || !stockResult.data) {
    const randomOffset = Math.floor(Math.random() * 1000);
    stockResult = await fetchRandomStock(randomOffset);
  }
  const stocks = stockResult.data ? [stockResult.data] : null;
  const stockErr = stockResult.error;

  if (stockErr || !stocks || stocks.length === 0) {
    await startNewRandomTraining(retries - 1);
    return;
  }

  const randomStock = stocks[0];
  currentStock.value = randomStock;

  const codeCandidates = [
    (randomStock as any).ts_code,
    randomStock.symbol,
    `${randomStock.symbol}.SZ`,
    `${randomStock.symbol}.SH`,
  ].filter(Boolean) as string[];
  const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
    listStockKlineByAny(codeCandidates, "daily"),
    listStockKlineByAny(codeCandidates, "weekly"),
    listStockKlineByAny(codeCandidates, "monthly"),
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
  weeklyData.value = format(weeklyRes.data ?? []);
  monthlyData.value = format(monthlyRes.data ?? []);
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
  applyChartLocale();
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
    name: "closeMarker",
    totalStep: 1,
    needDefaultPointFigure: false,
    needDefaultXAxisFigure: false,
    needDefaultYAxisFigure: false,
    createPointFigures: ({ coordinates }) => {
      if (coordinates.length > 0) {
        const x = coordinates[0].x;
        const y = coordinates[0].y;
        const color = "#3B82F6";
        return [
          {
            type: "circle",
            attrs: { x, y, r: 6 },
            styles: { style: "stroke", color },
            ignoreEvent: true,
          },
          {
            type: "text",
            attrs: {
              x,
              y: y - 16,
              text: "X",
              baseline: "bottom",
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
    resizeObserver = new ResizeObserver(() => {
      chartInstance.value?.resize();
    });
    resizeObserver.observe(chartRef.value as Element);

    applyBaseStyles();
    applyChartLocale();

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
        } as any);

        chartInstance.value?.setStyles({
          indicator: {
            bars: [
              {
                upColor: upColor,
                downColor: downColor,
                noChangeColor: textColor,
              },
            ],
          },
        } as any);
      },
      { immediate: true },
    );

    watch(
      () => locale.value,
      () => {
        applyChartLocale();
      },
    );

    // Initial resize to ensure correct rendering
    chartInstance.value.resize();

    setTimeout(() => {
      if (!isMounted.value) return;
      bootstrapSession();
    }, 500);

    // Handle resize
    // Removed duplicate listener logic
  }
  window.addEventListener("online", () => {
    bootstrapSession();
  });
  window.addEventListener("offline", () => {
    //
  });
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
  if (resizeObserver) {
    resizeObserver.disconnect();
    resizeObserver = null;
  }

  window.removeEventListener("keydown", handleKeydown);
  window.removeEventListener("online", () => {});
  window.removeEventListener("offline", () => {});

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
    handleTrade("LONG");
    return;
  }

  // Sell/Short: 'S'
  if (key === "s" && showQuickTrade.value) {
    handleTrade("SHORT");
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
  if (activeSessionId.value && currentDate.value) {
    scheduleProgressSave();
  }

  if (isTrainingWindowEnded.value && !autoSettled.value) {
    autoSettled.value = true;
    (async () => {
      try {
        if (tradeStore.positions.value.length > 0) {
          const posList = [...tradeStore.positions.value];
          for (const p of posList) {
            await closePosition(p.id, p.amount);
          }
        }
        await finalizeSession("completed");
        await refreshSessionSnapshot();
        message.success(t("training.messages.sessionEnded") || "Session ended");
      } catch {}
    })();
  }
}

function scheduleProgressSave() {
  if (!activeSessionId.value || !currentDate.value) return;
  const id = activeSessionId.value;
  const ts = new Date(currentDate.value).toISOString();
  if (progressSaveTimer) clearTimeout(progressSaveTimer);
  progressSaveTimer = setTimeout(() => {
    saveSessionProgress(id, ts);
  }, 800);
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
    message.warning(t("training.messages.dailyOnlyPlayback"));
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
    message.warning(t("training.messages.dailyOnlyPlayback"));
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
    message.warning(t("training.messages.dailyOnlyPlayback"));
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
  const baseBalance = isTrainingStarted.value
    ? tradeStore.balance.value
    : accountBalance.value;
  const tentative = Math.floor((baseBalance * (p / 100)) / currentPrice.value);
  tradeAmount.value = tentative > 1 ? tentative : 1;
}

async function refreshSessionSnapshot() {
  if (!activeSessionId.value) return;
  const { data } = await getTrainingSession(activeSessionId.value);
  if (data) {
    tradeStore.balance.value = Number((data as any).cash || 0);
    // Parse positions from snapshot
    if ((data as any).positions) {
      try {
        const parsed = JSON.parse((data as any).positions);
        if (Array.isArray(parsed)) {
          tradeStore.positions.value = parsed.map((p) => ({
            ...p,
            entryTime: p.entryTime || Date.now(),
          }));
        }
      } catch (e) {}
    }
    await refreshProfile();
  }
}

async function loadTradeLogs() {
  const currentSessionId = activeSessionId.value;
  if (!currentSessionId) {
    tradeStore.tradeRecords.value = [];
    tradeStore.positions.value = [];
    return;
  }
  if (isFetchingLogs.value) return;
  isFetchingLogs.value = true;
  try {
    const res = await getTrainingTrades(currentSessionId, 200);
    // 确保在网络请求返回时，当前会话未发生改变
    if (currentSessionId !== activeSessionId.value) return;

    if (res.data) {
      const docs = res.data as any[];
      const mapped = docs.map((d) => {
        let ex: any = {};
        try {
          ex =
            typeof d.extra === "string" ? JSON.parse(d.extra) : d.extra || {};
        } catch {
          ex = {};
        }
        return {
          id: d.$id,
          time: d.trade_time,
          action: d.action,
          amount: Number(d.amount || 0),
          price: Number(d.price || 0),
          realizedPnl:
            ex && typeof ex.realized_pnl === "number"
              ? Number(ex.realized_pnl)
              : undefined,
          fee: Number(d.fee || 0),
        };
      });
      tradeStore.tradeRecords.value = mapped;
      if (docs.length > 0) {
        const latest = docs[0];
        let posAfter: any = null;
        try {
          posAfter =
            typeof latest.position_after === "string"
              ? JSON.parse(latest.position_after)
              : latest.position_after;
        } catch {
          posAfter = null;
        }

        if (Array.isArray(posAfter)) {
          tradeStore.positions.value = posAfter
            .filter((p: any) => p.amount > 0)
            .map((p: any) => ({
              id: p.id || `server-${p.side}-${latest.$id}`,
              side: p.side,
              amount: p.amount,
              entryPrice: p.entryPrice,
              entryTime: new Date(latest.trade_time).getTime(),
            }));
        } else if (
          posAfter &&
          typeof posAfter.amount === "number" &&
          posAfter.amount !== 0 &&
          (posAfter.side === "LONG" || posAfter.side === "SHORT")
        ) {
          tradeStore.positions.value = [
            {
              id: `server-${latest.$id}`,
              side: posAfter.side,
              amount: Math.abs(posAfter.amount),
              entryPrice: Number(posAfter.entryPrice || 0),
              entryTime: new Date(latest.trade_time).getTime(),
            },
          ];
        } else {
          tradeStore.positions.value = [];
        }
      } else {
        tradeStore.positions.value = [];
      }
    }
  } finally {
    isFetchingLogs.value = false;
  }
}

async function persistTradeLog(
  action: "LONG" | "SHORT" | "CLOSE",
  amount: number,
  price: number,
  orderId: string,
  closeSide?: "LONG" | "SHORT",
): Promise<boolean> {
  if (!user.value) return false;
  const klineTimestamp = fullData.value[currentIndex.value]?.timestamp ?? null;

  if (activeSessionId.value) {
    const result = await executeTrainingOrder({
      sessionId: activeSessionId.value,
      action,
      amount,
      priceHint: price,
      klineTimestamp,
      orderId,
      closeSide,
    });
    if (result.error || !result.data) {
      throw new Error(result.error?.message || "Trade execution failed");
    }

    const data = result.data as any;

    // 严格使用后端计算出的 cash
    tradeStore.balance.value = data.cash;
    if (profile.value && data.trainingBalance !== undefined) {
      profile.value.training_balance = data.trainingBalance;
    } else if (profile.value) {
      profile.value.training_balance = data.cash;
    }

    // 更新持仓状态 (Hedging mode: afterPosition is now an array)
    if (Array.isArray(data.afterPosition)) {
      tradeStore.positions.value = data.afterPosition
        .filter((p: any) => p.amount > 0)
        .map((p: any) => ({
          id: p.id || `server-${p.side}-${data.seqNo}`,
          side: p.side,
          amount: p.amount,
          entryPrice: p.entryPrice,
          entryTime: klineTimestamp || Date.now(),
        }));
    } else {
      // Fallback for older format
      tradeStore.positions.value = [];
    }

    // 避免 Appwrite 索引延迟导致获取不到最新记录，手动构造 TradeRecord 并推入最前方
    tradeStore.tradeRecords.value.unshift({
      id: orderId,
      time: data.tradeTime || new Date().toISOString(),
      action: action === "LONG" || action === "SHORT" ? action : "CLOSE",
      side: action === "CLOSE" ? closeSide : action,
      amount: amount,
      price: price,
      fee: data.fee,
      realizedPnl:
        data.realizedPnl !== undefined ? data.realizedPnl : undefined,
    });

    return true;
  }
  return false;
}

async function finalizeSession(status: "completed" | "aborted") {
  if (!activeSessionId.value) return;

  const result = await settleTrainingSession(activeSessionId.value, status);

  if (result.error || !result.data) {
    message.error(
      t("training.messages.sessionSaveFailed") || "Session settle failed",
    );
  }

  if (user.value) {
    await refreshProfile();
  }

  // Always clear activeSessionId and trade store even if settle fails
  // to prevent old data bleeding into new sessions
  activeSessionId.value = null;
  tradeStore.init(accountBalance.value);
}

async function handleTrade(side: string) {
  if (isTrainingWindowEnded.value) {
    message.warning(t("training.messages.trainingEndedViewOnly"));
    return;
  }
  if (!activeSessionId.value) {
    message.warning(t("training.messages.sessionNotInitialized"));
    return;
  }
  if (isTrading.value) return;

  const amt = Number(tradeAmount.value || 0);
  if (amt <= 0) {
    message.error(t("training.messages.invalidAmount") || "Invalid amount");
    return;
  }

  isTrading.value = true;
  const timestamp = fullData.value[currentIndex.value].timestamp;
  try {
    const posSide = side === "LONG" ? "LONG" : "SHORT";
    const orderId = ID.unique();

    // 执行后端同步，成功后会自动更新本地 tradeRecords 和 balance
    await persistTradeLog(
      posSide as "LONG" | "SHORT",
      amt,
      currentPrice.value,
      orderId,
    );

    if (chartInstance.value) {
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
  } catch (e: any) {
    message.error(e.message || "Failed to open position");
  } finally {
    isTrading.value = false;
  }
}

async function closePosition(id: string, amount: number) {
  if (isTrainingWindowEnded.value) {
    message.warning(t("training.messages.trainingEndedViewOnly"));
    return;
  }
  if (isTrading.value) return;

  const pos = tradeStore.positions.value.find((p) => p.id === id);
  if (!pos) return;

  isTrading.value = true;
  const timestamp = fullData.value[currentIndex.value].timestamp;

  try {
    const orderId = ID.unique();

    // In Hedging mode, we always use CLOSE and explicitly specify which side we are closing
    await persistTradeLog(
      "CLOSE",
      amount,
      currentPrice.value,
      orderId,
      pos.side as "LONG" | "SHORT",
    );

    if (chartInstance.value) {
      chartInstance.value.createOverlay({
        name: "closeMarker",
        extendData: { type: "CLOSE", price: currentPrice.value },
        points: [{ timestamp: timestamp, value: currentPrice.value }],
      });
    }

    message.success(
      t("training.messages.positionClosed", {
        pl: (tradeStore.tradeRecords.value[0]?.realizedPnl || 0).toFixed(2),
      }),
    );
  } catch (e: any) {
    message.error(e.message || "Failed to close position");
  } finally {
    isTrading.value = false;
  }
}

async function handlePartialClose(id: string, percent: number) {
  const pos = tradeStore.positions.value.find((p) => p.id === id);
  if (!pos) return;

  let amountToClose = Math.floor(pos.amount * (percent / 100));

  // If the calculated amount is 0 but the position amount is > 0 and percent is > 0,
  // we should close at least 1 share to ensure partial close works for small positions.
  // Unless it's a 100% close, then we just take the full amount.
  if (percent === 100) {
    amountToClose = pos.amount;
  } else if (amountToClose === 0 && pos.amount > 0) {
    amountToClose = 1;
  }

  if (amountToClose > 0) {
    await closePosition(id, amountToClose);
  }
}

async function reversePosition(id: string) {
  const pos = tradeStore.positions.value.find((p) => p.id === id);
  if (!pos) return;
  const amount = pos.amount;
  await closePosition(id, amount);
  await handleTrade(pos.side === "LONG" ? "SHORT" : "LONG");
}

async function exitTraining() {
  if (!isTrainingStarted.value) {
    router.push("/");
    return;
  }
  if (!isTrainingWindowEnded.value) {
    stopPlay();
    isTrainingStarted.value = false;
    setFullscreen(false);
    if (document.fullscreenElement) {
      document.exitFullscreen().catch((err) => console.error(err));
    }
    message.warning(
      t("training.messages.onlyEndAtTerminal") ||
        "Only when reaching the end date can you end this session",
    );
    return;
  }
  try {
    await finalizeSession("completed");
  } catch (e) {
    console.error(e);
    message.error(t("training.messages.sessionSaveFailed"));
  }
  stopPlay();
  isTrainingStarted.value = false;
  setFullscreen(false);
  if (document.fullscreenElement) {
    document.exitFullscreen().catch((err) => console.error(err));
  }
  message.info(t("training.messages.sessionEnded"));
}

async function bootstrapSession() {
  try {
    const res = await listSessions(1);
    const latest = res.data?.documents?.[0];
    if (
      latest &&
      (latest.status === "active" ||
        latest.status === "running" ||
        latest.status === "initialized" ||
        latest.status === "pending" ||
        latest.status === "in_progress" ||
        latest.status === "not_started")
    ) {
      const tsCode = latest.ts_code || latest.symbol;
      const displaySymbol = latest.symbol || tsCode;
      let info = (await getStockInfoByTsCode(tsCode)).data;
      if (!info) {
        info = (await getStockInfoBySymbol(displaySymbol)).data;
      }
      currentStock.value = {
        symbol: info?.symbol || displaySymbol,
        name: info?.name || displaySymbol,
        ts_code: tsCode,
      } as any;
      const codeCandidates = [
        tsCode,
        displaySymbol,
        `${displaySymbol}.SZ`,
        `${displaySymbol}.SH`,
      ].filter(Boolean) as string[];
      const [dailyRes, weeklyRes, monthlyRes] = await Promise.all([
        listStockKlineByAny(codeCandidates, "daily"),
        listStockKlineByAny(codeCandidates, "weekly"),
        listStockKlineByAny(codeCandidates, "monthly"),
      ]);
      // 若会话存在但暂无对应K线，保持当前会话，不自动切换随机训练
      if (!dailyRes.data || dailyRes.data.length === 0) {
        message.warning(
          t("training.messages.sessionNotInitialized") ||
            "No K-Line data for this session",
        );
        isChartLoaded.value = true;
        activeSessionId.value = latest.$id;
        await refreshSessionSnapshot();
        await loadTradeLogs();
        return;
      }
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
      dailyData.value = format(dailyRes.data ?? []);
      weeklyData.value = format(weeklyRes.data ?? []);
      monthlyData.value = format(monthlyRes.data ?? []);
      const sDate = new Date(
        latest.train_start_date || latest.start_date,
      ).getTime();
      const eDate = new Date(
        latest.train_end_date || latest.end_date,
      ).getTime();
      let sIdx = dailyData.value.findIndex((d) => d.timestamp >= sDate);
      if (sIdx < 0) sIdx = 0;
      let eIdx = dailyData.value.findIndex((d) => d.timestamp > eDate);
      if (eIdx < 0) eIdx = dailyData.value.length - 1;
      trainingStartIndex.value = sIdx;
      trainingEndIndex.value = Math.max(eIdx - 1, sIdx + 10);
      fullData.value = dailyData.value;
      // 恢复进度：如果存在 current_date，则按其定位 currentIndex；否则用训练开始索引
      let resumeIdx = trainingStartIndex.value;
      if (latest.current_date) {
        const cd = new Date(latest.current_date).getTime();
        const idx = dailyData.value.findIndex((d) => d.timestamp >= cd);
        if (idx >= 0 && idx <= trainingEndIndex.value) {
          resumeIdx = idx;
        }
      }
      initialDataRef.value = dailyData.value.slice(0, resumeIdx + 1);
      currentIndex.value = resumeIdx;
      currentDate.value = dailyData.value[resumeIdx]?.timestamp ?? null;
      currentPrice.value = dailyData.value[resumeIdx]?.close ?? 0;
      if (chartInstance.value) {
        clearIndicators();
        chartInstance.value.resetData();
        setupDataLoader();
        setupIndicatorsFromState();
        chartInstance.value.setSymbol({
          ticker: displaySymbol,
          pricePrecision: 2,
          volumePrecision: 0,
        });
        currentTimeframe.value = "daily";
        chartInstance.value.setPeriod({ type: "day", span: 1 });
        updateChartForDate(currentDate.value!);
        syncTrainingBoundaryOverlays();
        await ensureChartSized();
      }
      activeSessionId.value = latest.$id;
      await refreshSessionSnapshot();
      await loadTradeLogs();
      isChartLoaded.value = true;
      return;
    }
  } catch (e) {
    await startNewRandomTraining();
  }
  await startNewRandomTraining();
  const sDate = new Date(
    dailyData.value[trainingStartIndex.value].timestamp,
  ).toISOString();
  const eDate = new Date(
    dailyData.value[trainingEndIndex.value].timestamp,
  ).toISOString();
  try {
    const { data } = await createTrainingSession({
      tsCode:
        (currentStock.value as any)?.ts_code ??
        currentStock.value?.symbol ??
        "",
      symbol: currentStock.value?.symbol ?? "",
      period: "daily",
      trainRange: {
        startIndex: trainingStartIndex.value,
        endIndex: trainingEndIndex.value,
        startDate: sDate,
        endDate: eDate,
      },
      startDate: sDate,
      endDate: eDate,
      startPrice: dailyData.value[trainingStartIndex.value].close,
    });
    activeSessionId.value = (data?.sessionId as string) ?? null;
  } catch {
    activeSessionId.value = null;
  }
}

async function startTraining() {
  await refreshProfile();
  isTrainingStarted.value = true;
  sessionTradeSeq.value = 0;
  sessionInitialBalance.value = accountBalance.value;
  sessionRealizedPnl.value = 0;
  sessionPeakBalance.value = sessionInitialBalance.value;
  tradeStore.init(accountBalance.value);
  if (activeSessionId.value) {
    await loadTradeLogs();
  }
  if (!activeSessionId.value && user.value && currentStock.value) {
    try {
      const sDate = new Date(
        dailyData.value[trainingStartIndex.value].timestamp,
      ).toISOString();
      const eDate = new Date(
        dailyData.value[trainingEndIndex.value].timestamp,
      ).toISOString();
      const { data, error } = await createTrainingSession({
        tsCode:
          (currentStock.value as any)?.ts_code ??
          currentStock.value.symbol ??
          "",
        symbol: currentStock.value.symbol ?? "",
        period: "daily",
        trainRange: {
          startIndex: trainingStartIndex.value,
          endIndex: trainingEndIndex.value,
          startDate: sDate,
          endDate: eDate,
        },
        startDate: sDate,
        endDate: eDate,
        startPrice: dailyData.value[trainingStartIndex.value].close,
      });
      if (!error && data?.sessionId) {
        activeSessionId.value = data.sessionId as string;
        await refreshSessionSnapshot();
        // Clear old logs explicitly before potentially loading new ones
        tradeStore.tradeRecords.value = [];
        tradeStore.positions.value = [];
        await loadTradeLogs();
      }
    } catch {}
  }
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

// resetSession removed per requirement: training can be moved only after completion
</script>

<style scoped>
#chart-container {
  width: 100%;
  height: 100%;
}
.compact-trade-group :deep(.n-button) {
  padding: 0 6px;
  font-weight: 500;
  font-size: 11px;
}
</style>
