<script setup>
    defineProps(['title']);
</script>

<template>
    <h1 class="text-purple-700">{{ title }}</h1>
</template>

<style scoped>

h1 {
  font-size: 20px;
  font-weight: 700;
  text-align: center;
  margin: 5% 0;
}

</style>