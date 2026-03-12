<template>
  <div class="page">
    <h1>选股</h1>
    <div class="search">
      <input placeholder="输入代码/名称" />
      <button>查询</button>
    </div>
    <div class="list">
      <div class="item">AAPL</div>
      <div class="item">TSLA</div>
      <div class="item">NVDA</div>
    </div>
  </div>
</template>
<script setup lang="ts">
</script>
<style scoped>
.search {
  display: flex;
  gap: 8px;
  margin-bottom: 12px;
}
input {
  flex: 1;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid #ddd;
}
button {
  padding: 10px 12px;
  border-radius: 8px;
  border: 0;
  background: #0ea05c;
  color: #fff;
}
.list {
  display: grid;
  gap: 8px;
}
.item {
  background: #fff;
  border: 1px solid #eee;
  padding: 10px 12px;
  border-radius: 8px;
}
</style>

