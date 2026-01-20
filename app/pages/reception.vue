<script setup lang="ts">
    import type { UseWebNotificationOptions } from '@vueuse/core'
    import { useWebNotification, useVibrate } from '@vueuse/core'
    import { useOnline } from '@vueuse/core'
    import type { ShallowRef } from 'vue'

    const online: Readonly<ShallowRef<boolean>> = useOnline()
    const isCameraOpen: Ref<boolean> = ref(false)
    const isPhotoTaken: Ref<boolean> = ref(false); 
    const camera = ref(null)
    const canvas = ref(null)
    const pseudo: Ref<string|null> = ref(localStorage.getItem('pseudo'))
    const image: Ref<string|null> =  ref(localStorage.getItem('image'))

    // Get rooms
    const selectedRoom =  ref('')
    const rooms:Ref<{[name: string]: Room}| null> = ref(null);
    const requestOptions = {
        method: "GET",
        headers: { "Content-Type": "application/json" },
    };
    const res: Response = await fetch("https://api.tools.gavago.fr/socketio/api/rooms", requestOptions);
    const response: { success: boolean, metadata: { time: string }, "data":{[roomName: string]: Room;}} = await res.json();
    const tempRooms:{[name: string]: Room} = await response.data;
    rooms.value = {
        ...tempRooms, 
        'L\'Adversaire': {clients: {}},
        'La Tour': {clients: {}},
        'Le Spectre': {clients: {}},
        'Le Cauchemar': {clients: {}},
        'Le Razoir': {clients: {}},
        'La Bête': {clients: {}},
        'La Sorcière': {clients: {}},
        'L\'Inconnue': {clients: {}},
        'La Prisonnière': {clients: {}},
        'La Demoiselle': {clients: {}},
        'Le Chat de l\'aiguille': {clients: {}},
        'La Furie': {clients: {}},
        'L\'Apotéose': {clients: {}},
        'La Princess et le Dragon': {clients: {}},
        'La Revenante': {clients: {}},
        'Le Moment de clarté': {clients: {}},
        'La Tanière': {clients: {}},
        'La Nature sauvage': {clients: {}},
        'L\'Épine': {clients: {}},
        'La Cage': {clients: {}},
        'L\'Éplorée': {clients: {}},
        'Et ils vécurent heureux': {clients: {}},
    }

    const options: UseWebNotificationOptions = {
        title: 'Votre image a été enregistrée dans la galerie ! ',
        dir: 'auto',
        lang: 'fr',
        renotify: true,
        tag: 'test',
    }

    const { show } = useWebNotification(options)
    const { vibrate } = useVibrate({ pattern: [300, 100, 300] })
    
    let tracks:MediaStreamTrack[] = [];
    const constraints = (window.constraints = {
        audio: false,
        video: {
            facingMode: {
                exact: "environment"
            }
        }
    });

    function createCameraElement() {
        const constraints = (window.constraints = {
            audio: false,
            video: true
        });
        navigator.mediaDevices
            .getUserMedia(constraints)
            .then(stream => {
                camera.value.srcObject = stream;
                tracks.push(...camera.value.srcObject.getTracks());
            })
            .catch(error => {
            alert("May the browser didn't support or there is some errors.");
        });
    }

    function stopCameraStream(tracks:MediaStreamTrack[]) {
        tracks.forEach(track => track.stop())
        
    }

    function toggleCamera() {
        isCameraOpen.value = !isCameraOpen.value
        if(isCameraOpen.value) {
            createCameraElement();
        } else {
            isPhotoTaken.value = false;
            stopCameraStream(tracks)
        }
    }

    function takePhoto() {
        isPhotoTaken.value = !isPhotoTaken.value;
        const context = canvas.value.getContext('2d');
        context.drawImage(camera.value, 0, 0, 450, 337.5);
    }

    function downloadImage() {
        const download:HTMLElement|null = document.getElementById("downloadPhoto");
        const photoTaken:HTMLCanvasElement|null = document.getElementById("photoTaken")
        if (photoTaken) {
            const canvas = photoTaken.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
            if (download) download.setAttribute("href", canvas);
            saveImage(canvas);
        }
    }

    function saveTakedImage() {
        const photoTaken:HTMLCanvasElement = document.getElementById("photoTaken")
        console.log(photoTaken)
        if (photoTaken){
            const canvas:string = photoTaken.toDataURL("image/jpeg")
                    .replace("image/jpeg", "image/octet-stream");
            image.value = canvas;
            saveImage(canvas);
        }
    }

    function saveImage(image:string) {
        let gallery = localStorage.getItem('gallery');
        let parsedGallery = [];
        if (gallery) parsedGallery = JSON.parse(gallery)
        parsedGallery.push({"image":image, "saved_at": new Date().toLocaleString()});
        localStorage.setItem('gallery',JSON.stringify(parsedGallery)); 
        show()
        vibrate()
    }

    watch(pseudo, async (newPseudo) => {
        if (newPseudo) localStorage.setItem('pseudo', newPseudo)
    })
    
    watch(image, async (newImage) => {
        if (newImage) localStorage.setItem('image', newImage)
    })
    
    function login(){
        localStorage.setItem('room', selectedRoom.value);
        if (pseudo && selectedRoom) {
            navigateTo(`/rooms/${selectedRoom.value}`);
        }
    }
</script>

<template>
    <div>
        <AppTitle title="Réception"/>
        <h2 class="mx-2">Se connecter</h2>
        <form class="w-[95%] mx-3" v-on:submit.prevent="login">
            <div class="grid grid-cols-2">
                <section>
                    <p>Photo de profil acctuelle</p>
                    <img :src="image" width="144" height="144"/>

                </section>
                <section class="border-2 text-center">
                    <div class="camera-button">
                        <button type="button" class="button is-rounded" :class="{ 'is-primary' : !isCameraOpen, 'is-danger' : isCameraOpen}" @click="toggleCamera">
                            <span v-if="!isCameraOpen">Open Camera</span>
                            <span v-else>Close Camera</span>
                        </button>
                    </div>
                    <div v-if="isCameraOpen" class="flex justify-center">
                        <video v-show="!isPhotoTaken" ref="camera" autoplay></video>
                        <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas"></canvas>
                    </div>
                    <button type="button" class="border-2 rounded-full" @click="takePhoto">
                        <Icon name="ic:baseline-camera-alt" class="px-4" />
                    </button>
                    <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
                        <a id="downloadPhoto" download="my-photo.jpg" class="button" role="button" @click="downloadImage">
                            Télécharger
                        </a>
                        <a role="button" @click="saveTakedImage">
                            Choisir en tant que photo de profil
                        </a>
                    </div>
                </section>
            </div>
            <div class="flex flex-col">
                <label>Pseudo</label>
                <input type="text"  v-model="pseudo" required />
            </div>
            <div class="flex flex-col" v-if="online">
                <label>Room</label>
                <select type="text"  v-model="selectedRoom" required >
                    <option v-for="(room, name) in rooms" :value="name">{{name}}</option>
                </select>
            </div>
            <button type="submit" v-if="online">Se connecter</button>
        </form>
    </div>
</template>

<style scoped>
h2 {
  font-size: 18px;
  font-weight: 500;
}
input, select {
    border: 1px rgb(180, 180, 180) solid;
    border-radius: 3em;
    font-size: 14px;
    width: 95%;
}
</style>