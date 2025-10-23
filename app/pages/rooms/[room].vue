<script setup lang="ts">
    import { io } from "socket.io-client";

    const socket = io('https://api.tools.gavago.fr', {  
        transports: ["websocket"],
    });

    const route = useRoute()
    const room = ref(route.params.room)
    const pseudo = ref(localStorage.getItem('pseudo'))
    const title = `Bienvenue dans la room "${room.value}", ${pseudo.value} !`;
    const messages = ref([]);
    const typedMessage = ref('');
    
    socket.on("connect", () => {
        console.log("✅ Connecté au serveur Socket.IO !");
        socket.emit("chat-join-room", {
            pseudo: pseudo.value,
            roomName: room.value,
        });

    });

    socket.on("error", (msg) => {
        alert(`Erreur du serveur: ${msg}.`);
    });

    socket.on("chat-msg", (msg) => {
        console.log(msg)
        msg.dateEmis = new Date(msg.dateEmis).toLocaleString();
        messages.value.push(msg);
        console.log(`message=: ${msg.content}.`);
    });

    socket.on("chat-msg", (msg) => {
        msg.dateEmis = new Date(msg.dateEmis);
        console.log(`message=: ${msg.content}.`);
    });

    function send() {
        socket.emit("chat-msg", {
            content: typedMessage.value,
            roomName: room.value,
        });
        typedMessage.value='';
    }
</script>

<template>
    <div>
        <AppTitle :title="title"/>
        <div id="chat">
            <div v-for="message in messages" class="grid grid-cols-[1fr_12fr_1fr] odd:bg-white even:bg-gray-100">
                <div class="user flex flex-col">
                    <p><strong>{{message.pseudo}}</strong></p>
                </div>
                <div v-if="message.pseudo == 'SERVER'"><em>{{message.content}}</em></div>
                <div v-else>{{message.content}}</div>
                <div><em>{{message.dateEmis}}</em></div>
            </div>
        </div>
        <form v-on:submit.prevent="send" class="grid grid-cols-[1fr_12fr_2fr]">
            <button type="button" class="border-2 rounded-full">
                <Icon name="ic:baseline-camera-alt" class="px-4" />
            </button>
            <input v-model="typedMessage" class="border-2" />
            <button type="submit" class="bg-black text-white p-2 rounded-2">Envoyer</button>
        </form>
    </div>
</template>
