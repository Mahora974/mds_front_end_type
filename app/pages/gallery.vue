<script setup lang="ts">
    const gallery = ref(JSON.parse(localStorage.getItem('gallery')));

    function downloadImage(index:number, image:string) {
        const download = document.getElementById("download_"+index);
        download.setAttribute("href", image);
        console.log(download)
    }

    function deleteImage(index:number) {
        gallery.value.splice(index,1);
        localStorage.setItem('gallery', JSON.stringify(gallery.value));

    }
</script>

<template>
    <div>
        <AppTitle title="Vos photos"/>
        <section class="m-1 grid gap-1 xl:grid-cols-8 grid-cols-4">
            <div v-for="(image, index) in gallery" > 
                <img :src="image.image">
                <p>{{image.saved_at}}</p>
                <div class="flex justify-around">
                    <a :id="'download_'+index" class="border-2 rounded-full" @click="downloadImage(index, image.image)" :download="'myphoto_'+image.saved_at+'.jpg'"><Icon name="ic:baseline-download" class="px-4" /></a>
                    <button class="border-2 rounded-full border-red-500" @click="deleteImage(index)"><Icon name="ic:baseline-delete" class="px-4 text-red-500" /></button>
                </div>

            </div>
        </section>
    </div>
</template>