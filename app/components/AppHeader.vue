<script setup lang="ts">
  import { useBattery, useOnline } from '@vueuse/core'
  import { useGeolocation } from '@vueuse/core'

  const online = useOnline()
  const room = ref(import.meta.client?localStorage.getItem('room'):null)
  const { charging, chargingTime, dischargingTime, level } = useBattery()
  const batteryIcon = ref('');
  const { coords, locatedAt, error, resume, pause } = useGeolocation()
  const address = ref('')

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

  async function determineCity(coords: {readonly accuracy: number; readonly altitude: number | null; readonly altitudeAccuracy: number | null;
    readonly heading: number | null;
    readonly latitude: number;
    readonly longitude: number;
    readonly speed: number | null;
}){
    const {longitude, latitude} = coords
    const res = await fetch(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=AIzaSyB28h3dTAeiwgMFAOFQoexmB9obhpmeBoE`);
    const response = await res.json();
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
  <div class="grid grid-cols-[1fr_10fr_1fr]">
    <div>
      <div>{{ address }}</div>
      <div class="flex" v-if="online"> <Icon name="ic:baseline-check-circle" class="text-green-900" /> En Ligne </div>
      <div class="flex" v-else><Icon name="ic:outline-cancel" class="text-grey-50" />Hors Ligne</div>
    </div>
    <h1 class="text-center text-lg font-bold">Titre</h1>
    <div>
      <div><Icon :name="batteryIcon" class="px-4" />{{level * 100}} %</div>
    </div>
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
