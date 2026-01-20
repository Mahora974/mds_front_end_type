<script setup lang="ts">
  /// <reference path="../../types/index.d.ts" />

  import { useBattery, useOnline } from '@vueuse/core'
  import { useGeolocation } from '@vueuse/core'
  import type { ShallowRef } from 'vue'

  const online:  Readonly<ShallowRef<boolean>> = useOnline()
  const room: Ref<string | null, string | null> = ref(import.meta.client?localStorage.getItem('room'):null)
  const { charging, level } = useBattery()
  const batteryIcon: Ref<string, string> = ref('');
  const { coords } = useGeolocation()
  const address: Ref<string, string> = ref('')

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

  async function determineCity(coords: Coord){
    const {longitude, latitude} = coords
    const res: Response = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB28h3dTAeiwgMFAOFQoexmB9obhpmeBoE`);
    const response: Geolocalisation= await res.json();
    return `${response.results[0].address_components[2].long_name}, ${response.results[0].address_components[5].long_name}`
  }

  
  watch(level, async (newLevel) => {
    determineBatteryIcon(newLevel, charging.value)
  })

  watch(coords, async (newCoords) => {
    address.value = await determineCity(coords.value)
  })
  
  watch(charging, async (newCharging) => {
    determineBatteryIcon(level.value, newCharging)
  })
</script>
<template>
  <div class="grid grid-cols-[1fr_5fr_1fr] bg-violet-500">
    <div>
      <div class="flex"  v-if="address"><Icon name="ic:baseline-location-on" class="px-4" />{{ address }}</div>
      <div class="flex" v-if="online"> <Icon name="ic:baseline-check-circle" class="text-green-900" /> En Ligne </div>
      <div class="flex" v-else><Icon name="ic:outline-cancel" class="text-grey-50" />Hors Ligne</div>
    </div>
    <h1 class="text-center text-lg font-bold">Chat - TP Front Typé MDS</h1>
    <div class="flex justify-end">
      <div><Icon :name="batteryIcon" class="px-4" />{{level * 100}} %</div>
    </div>
  </div>
  <nav class="bg-purple-400">
    <ul class="grid grid-cols-4">
      <li><NuxtLink class="block text-center p-2 w-full hover:bg-purple-300" to="/">Accueil</NuxtLink></li>
      <li><NuxtLink class="block text-center p-2 w-full hover:bg-purple-300" to="/reception">Réception</NuxtLink></li>
      <li><NuxtLink class="block text-center p-2 w-full hover:bg-purple-300" :to="`/rooms/${room}`">Chat</NuxtLink></li>
      <li><NuxtLink class="block text-center p-2 w-full hover:bg-purple-300" to="/gallery">Gallerie</NuxtLink></li>
    </ul>
  </nav>
</template>
