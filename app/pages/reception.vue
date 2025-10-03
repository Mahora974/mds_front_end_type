<script setup >    
    const isCameraOpen = ref(false)
    const isPhotoTaken = ref(false); 
    const camera = ref(null)
    const canvas = ref(null)
    let tracks = [];
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

    function stopCameraStream(tracks) {
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
    }
</script>

<template>
  <div>
    <AppTitle title="Reception"/>
    <h2 class="mx-2">Se connecter</h2>
    <form class="w-[100%] mx-3">
        <section class="border-2 text-center">
            <div class="camera-button">
                <button type="button" class="button is-rounded" :class="{ 'is-primary' : !isCameraOpen, 'is-danger' : isCameraOpen}" @click="toggleCamera">
                    <span v-if="!isCameraOpen">Open Camera</span>
                    <span v-else>Close Camera</span>
                </button>
            </div>
            <div v-if="isCameraOpen" class="flex justify-center">
                <video v-show="!isPhotoTaken" ref="camera" :width="450" :height="337.5" autoplay></video>
                <canvas v-show="isPhotoTaken" id="photoTaken" ref="canvas" :width="450" :height="337.5"></canvas>
            </div>
            <button type="button" class="border-2 rounded-full" @click="takePhoto">
                <Icon name="ic:baseline-camera-alt" class="px-4" />
            </button>
            <div v-if="isPhotoTaken && isCameraOpen" class="camera-download">
                <a id="downloadPhoto" download="my-photo.jpg" class="button" role="button" @click="downloadImage">
                    Download
                </a>
            </div>
        </section>
        <div class="inputs">
            <div class="flex flex-col">
                <label>Pseudo</label>
                <input type="text" />
            </div>
            <div class="flex flex-col">
                <label>Salle</label>
                <select>
                    <option>Room 1</option>
                    <option>Room 2</option>
                </select>
            </div>
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
.inputs {
    margin: 1% 0;
    width: 100%;
    display: grid;
    grid-template-columns: 1fr 1fr;
    row-gap: 5%;
}
.form-group input {
    border: 1px rgb(180, 180, 180) solid;
    border-radius: 3em;
    font-size: 14px;
    width: 95%;
}
</style>