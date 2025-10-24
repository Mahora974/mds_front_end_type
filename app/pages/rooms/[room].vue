<script setup lang="ts">
    import { io } from "socket.io-client";
    import { useBattery, useOnline } from '@vueuse/core'

    const online = useOnline()

    const socket = io('https://api.tools.gavago.fr', {  
        transports: ["websocket"],
    });

    const route = useRoute()
    const roomUrl = ref(route.params.room)
    if (roomUrl.value !== localStorage.getItem('room')) {
        roomUrl.value = localStorage.getItem('room');
    }
    const rooms = JSON.parse(localStorage.getItem('rooms'));
    const roomName = rooms.find((room:{name:string, url:string}) => room.url == roomUrl.value);
    const pseudo = ref(localStorage.getItem('pseudo'))
    const title = `Bienvenue dans la room "${roomName.name}", ${pseudo.value} !`;
    const messages = ref([]);
    const typedMessage = ref('');
    if (!online.value) {
        messages.value = JSON.parse(localStorage.getItem(`log-message-${roomUrl.value}`));
    }
    
    socket.on("connect", () => {
        console.log("✅ Connecté au serveur Socket.IO !");
        socket.emit("chat-join-room", {
            pseudo: pseudo.value,
            roomName: roomUrl.value,
        });

    });

    socket.on("error", (msg) => {
        alert(`Erreur du serveur: ${msg}.`);
    });

    socket.on("chat-msg", (msg) => {
        msg.dateEmis = new Date(msg.dateEmis);
        messages.value.push(msg);
        localStorage.setItem(`log-message-${roomUrl.value}`,JSON.stringify(messages.value));
    });

    function send() {
        socket.emit("chat-msg", {
            content: typedMessage.value,
            roomName: roomUrl.value,
        });
        typedMessage.value='';
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
                <div v-if="message.pseudo == 'SERVER'"><em>{{message.content}}</em></div>
                <div v-else>{{message.content}}</div>
                <div><em>{{message.dateEmis.toLocaleString()}}</em></div>
            </div>
        </div>
        <form v-if="online" v-on:submit.prevent="send" class=" fixed bottom-0 inset-x-0 grid grid-cols-[1fr_12fr_2fr]">
            <button type="button" class="border-2 bg-white">
                <Icon name="ic:baseline-camera-alt" class="px-4" />
            </button>
            <input v-model="typedMessage" class="border-2" />
            <button type="submit" class="bg-black text-white p-2 rounded-2">Envoyer</button>
        </form>
    </div>
</template>
