<script setup lang="ts">
    import { io } from "socket.io-client";
    import { useBattery, useOnline, useVibrate, useWebNotification, type UseWebNotificationOptions } from '@vueuse/core'

    class Message {
        categorie: string;
        content: string;
        dateEmis: Date;
        pseudo: string;
        roomName: string;
        serverId: string;
        id_image: string | undefined;
        constructor(categorie: string, content: string, dateEmis: Date, pseudo: string, roomName: string, serverId: string,id_image?: string) {
            this.categorie = categorie;
            this.content = content;
            this.dateEmis = dateEmis;
            this.pseudo = pseudo;
            this.roomName = roomName;
            this.serverId = serverId;
            this.id_image = id_image;
        }
        
    }

    const online = useOnline()
    const isCameraOpen = ref(false)
    const isPhotoTaken = ref(false); 
    const camera = ref(null)
    const canvas = ref(null)
    const socket = io('https://api.tools.gavago.fr', {  
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
    const { vibrate, isSupported } = useVibrate({ pattern: [300, 100, 300] })
    const notify = async () => {
        if (await ensurePermissions())
        show()
    vibrate
    }


    const route = useRoute()
    const room = ref(route.params.room)
    if (room.value !== localStorage.getItem('room')) {
        room.value = localStorage.getItem('room');
    }
    const pseudo = ref(localStorage.getItem('pseudo'))
    const title = `Bienvenue dans la room "${room.value}", ${pseudo.value} !`;
    const messages:Ref<Message[]> = ref([]);
    const typedMessage = ref('');
    if (!online.value) {
        messages.value = JSON.parse(localStorage.getItem(`log-message-${room.value}`));
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
            const imageMessage = new Message("IMAGE", image, new Date(), "SERVER", msg.roomName, msg.serverId, msg.id_image); 
            messages.value.push(imageMessage);
        }
    });

    function send() {
        socket.emit("chat-msg", {
            content: typedMessage.value,
            roomName: room.value,
        });
        typedMessage.value='';
    }

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
        context.drawImage(camera.value, 0, 0, 195,160);
    }

    function downloadImage() {
        const download = document.getElementById("downloadPhoto");
        const canvas = document.getElementById("photoTaken").toDataURL("image/jpeg")
            .replace("image/jpeg", "image/octet-stream");
        if (download) {
            download.setAttribute("href", canvas);
        }
        saveImage(canvas);
    }

    function saveTakedImage() {
        const canvas:string = document.getElementById("photoTaken").toDataURL("image/jpeg")
                .replace("image/jpeg", "image/octet-stream");
        saveImage(canvas);
    }

    function saveImage(image:string) {
        let gallery = localStorage.getItem('gallery');
        if (gallery){
            let parsedGallery = JSON.parse(gallery)??[];
            parsedGallery.push({"image":image, "saved_at": new Date().toLocaleString()});
            localStorage.setItem('gallery',JSON.stringify(parsedGallery)); 
        }
        notify()
        vibrate()
    }

    async function sendPicture() {
        const photoData:string = document.getElementById("photoTaken").toDataURL("image/jpeg").replace("image/jpeg", "image/octet-stream");
        const res = await fetch(`https://api.tools.gavago.fr/socketio/api/images/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ id: socket.id, image_data: photoData })
        })
    }

</script>

<template>
    <div>
        <AppTitle class="text-purple-700" :title="title"/>
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
