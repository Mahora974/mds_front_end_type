<script setup lang="ts">
  import { useBattery } from '@vueuse/core'

  const room = ref(localStorage.getItem('room'))
  const { charging, chargingTime, dischargingTime, level } = useBattery()
  const batteryIcon = ref('');

  function determineBatteryIcon(level:number, charging:boolean){
    let battery = level*100;
    let charge = charging?'-charging':'';
    if (battery == 100) {
      batteryIcon.value = `ic:twotone-battery${charge}-full`
    } else if (battery < 10) {
      batteryIcon.value = "ic:twotone-battery-alert"
    } else {
      batteryIcon.value = `ic:twotone-battery${charge}-${Math.floor(battery/10)}0`
    }
  }
  
  watch(level, async (newLevel) => {
    determineBatteryIcon(newLevel, charging.value)
  })
  
  watch(charging, async (newCharging) => {
    determineBatteryIcon(level.value, newCharging)
  })
</script>
<template>
  <div class="grid grid-cols-[12fr_1fr]">
    <h1 class="text-center text-lg font-bold">Titre</h1>
    <div><Icon :name="batteryIcon" class="px-4" />{{level * 100}} %</div>
  </div>
  <nav >
    <ul class="flex justify-around">
      <li><button class="p-2"><NuxtLink to="/">Accueil</NuxtLink></button></li>
      <li><button class="p-2"><NuxtLink to="/reception">Réception</NuxtLink></button></li>
      <li><button class="p-2"><NuxtLink :to="`/rooms/${room}`">Chat</NuxtLink></button></li>
      <li><button class="p-2"><NuxtLink to="/gallery">Gallerie</NuxtLink></button></li>
    </ul>
  </nav>
</template>
