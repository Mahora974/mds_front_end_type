<script setup lang="ts">
    /// <reference path="../../../types/index.d.ts" />
    import { io, Socket } from "socket.io-client";
    import { useOnline, useVibrate, useWebNotification, type UseWebNotificationOptions } from '@vueuse/core'
    import type { ShallowRef } from "vue";
    import type { RouteLocationNormalizedGeneric } from "vue-router";

    const online: Readonly<ShallowRef<boolean>> = useOnline()
    const isCameraOpen: Ref<boolean> = ref(false)
    const isPhotoTaken: Ref<boolean> = ref(false); 
    const camera: Ref<null> = ref(null)
    const canvas: Ref<null> = ref(null)
    const socket:Socket = io('https://api.tools.gavago.fr', {  
        transports: ["websocket"],
    });
    const options: UseWebNotificationOptions = {
        title: 'Votre image a été enregistrée dans la galerie ! ',
        dir: 'auto',
        lang: 'fr',
        renotify: true,
        tag: 'test',
    }

    const {show,ensurePermissions} = useWebNotification(options)
    const { vibrate } = useVibrate({ pattern: [300, 100, 300] })
    const notify: () => Promise<void> = async () => {
        if (await ensurePermissions())
        show()
        vibrate()
    }


    const route:RouteLocationNormalizedGeneric = useRoute()
    const room: Ref = ref(route.params.room)
    const savedRoom: string|null = localStorage.getItem('room')
    if (savedRoom && room.value !== savedRoom) {
        room.value = savedRoom;
    }
    const pseudo:Ref<string | null> = ref(localStorage.getItem('pseudo'))
    const title:string  = `Bienvenue dans la room "${room.value}", ${pseudo.value} !`;
    const messages:Ref<Message[]> = ref([]);
    const typedMessage:Ref<string> = ref('');
    const logs: string|null = localStorage.getItem(`log-message-${room.value}`)
    if (!online.value && logs) {
        messages.value = JSON.parse(logs);
    }
    
    socket.on("connect", () => {
        socket.emit("chat-join-room", {
            pseudo: pseudo.value,
            roomName: room.value,
        });

    });

    socket.on("error", (msg: Message) => {
        alert(`Erreur du serveur: ${msg}.`);
    });

    // Reception of a new message or image
    socket.on("chat-msg", async (msg: Message) => {
        msg.dateEmis = new Date(msg.dateEmis);
        messages.value.push(msg);
        localStorage.setItem(`log-message-${room.value}`,JSON.stringify(messages.value));
        if (msg.categorie == 'NEW_IMAGE'){
            const res = await fetch(`https://api.tools.gavago.fr/socketio/api/images/${msg.id_image}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json'
                },
            })  
            const response = await res.json()
            const image = await response.data_image
            const imageMessage:Message = {
                categorie: "IMAGE", 
                content:image, 
                dateEmis: new Date(), 
                pseudo: "SERVER", 
                roomName:msg.roomName, 
                serverId:msg.serverId, 
                id_image:msg.id_image
            }; 
            messages.value.push(imageMessage);
        }
    });

    // Send message
    function send() {
        socket.emit("chat-msg", {
            content: typedMessage.value,
            roomName: room.value,
        });
        typedMessage.value='';
    }

        let tracks:MediaStreamTrack[] = [];

    // Open Camera 
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

    // CLose Camera
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
        context.drawImage(camera.value, 0, 0, 195,160);
    }

    function downloadImage() {
        const download = document.getElementById("downloadPhoto");
        const photoTaken: HTMLCanvasElement|null = document.getElementById("photoTaken");
        if (photoTaken) {
            const canvas = photoTaken.toDataURL("image/jpeg")
                .replace("image/jpeg", "image/octet-stream");
            if (download) {
                download.setAttribute("href", canvas);
            }
            saveImage(canvas);
        }
    }

    // Choose as profile picture
    function saveTakedImage() {
        const photoTaken: HTMLCanvasElement|null = document.getElementById("photoTaken");
        if (photoTaken) {
            const canvas:string = photoTaken.toDataURL("image/jpeg")
                    .replace("image/jpeg", "image/octet-stream");
            saveImage(canvas);
        }
    }

    // Save Image in the galley
    function saveImage(image:string) {
        let gallery = localStorage.getItem('gallery');
        if (gallery){
            let parsedGallery = JSON.parse(gallery)??[];
            parsedGallery.push({"image":image, "saved_at": new Date().toLocaleString()});
            localStorage.setItem('gallery',JSON.stringify(parsedGallery)); 
        }
        notify()
    }

    async function sendPicture() {
        const photoTaken: HTMLCanvasElement|null = document.getElementById("photoTaken");
        if (photoTaken) {
            const photoData:string = photoTaken.toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
            await fetch(`https://api.tools.gavago.fr/socketio/api/images/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ id: socket.id, image_data: photoData })
            })
        }
    }

</script>

<template>
    <div>
        <AppTitle :title="title"/>
        <div id="chat" class="mb-4">
            <div v-for="message in messages" class="grid grid-cols-[1fr_12fr_1fr] gap-2 odd:bg-white even:bg-gray-100">
                <div class="user flex flex-col">
                    <p><strong>{{message.pseudo}}</strong></p>
                </div>
                <div v-if="message.categorie == 'IMAGE'"><img :src="message.content"/></div>
                <div v-else-if="message.pseudo == 'SERVER'"><em>{{message.content}}</em></div>
                <div v-else>{{message.content}}</div>
                <div><em>{{message.dateEmis.toLocaleString()}}</em></div>
            </div>
        </div>
        <div class="fixed bottom-0 inset-x-0" v-if="online">
            <div class="border-2 w-40 h-40"  v-if="isCameraOpen">
                <div class="border-4 border-b-8 bg-white border-white w-full h-full text-center p-2">
                    <div class="border-2 w-full">
                        <video v-show="!isPhotoTaken" ref="camera" class="w-full h-full" autoplay></video>
                        <canvas v-show="isPhotoTaken" id="photoTaken" class="w-30 h-28" ref="canvas"></canvas>
                    </div>
                    <div v-if="isPhotoTaken && isCameraOpen" class="max-h-2">
                        <a id="downloadPhoto" download="my-photo.jpg" class="button" role="button" @click="downloadImage">
                            <Icon name="ic:baseline-download" class="px-4" />
                        </a>
                        <a role="button" @click="saveTakedImage">
                            <Icon name="ic:baseline-add-photo-alternate" class="px-4" />
                        </a>
                        <a role="button" @click="sendPicture">
                            <Icon name="ic:sharp-send" class="px-4" />
                        </a>
                    </div>
                    <button v-else @click="takePhoto"><Icon name="ic:round-camera-alt" class="px-4" /></button>
                </div>
            </div>
            <form  v-on:submit.prevent="send" class="grid grid-cols-[1fr_12fr_2fr]">
                <button type="button" class="border-2 bg-white"  @click="toggleCamera">
                    <Icon name="ic:round-camera-alt" class="px-4" />
                </button>
                <input v-model="typedMessage" class="border-2" />
                <button type="submit" class="bg-black text-white p-2 rounded-2">Envoyer</button>
            </form>
        </div>
    </div>
</template>
