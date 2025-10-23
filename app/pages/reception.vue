<script setup lang="ts">
    import type { UseWebNotificationOptions } from '@vueuse/core'
    import { useWebNotification } from '@vueuse/core'
    const isCameraOpen = ref(false)
    const isPhotoTaken = ref(false); 
    const camera = ref(null)
    const canvas = ref(null)
    const pseudo = ref(localStorage.getItem('pseudo'))
    const image =  ref(localStorage.getItem('image'))
    const room =  ref('')
    const options: UseWebNotificationOptions = {
        title: 'Votre image a été enregistrée dans la galerie ! ',
        dir: 'auto',
        lang: 'fr',
        renotify: true,
        tag: 'test',
    }

    const {
        isSupported,
        show,
    } = useWebNotification(options)

    
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
        const download = document.getElementById("downloadPhoto");
        const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
            .replace("image/jpeg", "image/octet-stream");
        download.setAttribute("href", canvas);
        console.log(download)
        saveImage(canvas);
    }

    function saveTakedImage() {
        const canvas:string = document.getElementById("photoTaken").toDataURL("image/jpeg")
                .replace("image/jpeg", "image/octet-stream");
        image.value = canvas;
        saveImage(canvas);
        
    }

    function saveImage(image:string) {
        let gallery = localStorage.getItem('gallery');
        let parsedGallery = JSON.parse(gallery)??[];
        parsedGallery.push({"image":image, "saved_at": new Date().toLocaleString()});
        localStorage.setItem('gallery',JSON.stringify(parsedGallery)); 
        show()
    }

    watch(pseudo, async (newPseudo, oldPseudo) => {
        localStorage.setItem('pseudo', newPseudo)
    })
    
    watch(image, async (newImage, oldImage) => {
        localStorage.setItem('image', newImage)
    })
</script>

<template>
    <div>
        <AppTitle title="Reception"/>
        <h2 class="mx-2">Se connecter</h2>
        <form class="w-[95%] mx-3">
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
                <input type="text"  v-model="pseudo" />
            </div>
            <div class="flex flex-col">
                <label>Room</label>
                <select type="text"  v-model="room" >
                    <option>Créer une room</option>
                    <option>Room1</option>
                    <option>Room2</option>
                </select>
            </div>
            <button>Se connecter</button>
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