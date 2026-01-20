export {}

declare global {
  type Coord = {
    readonly accuracy: number
    readonly altitude: number | null
    readonly altitudeAccuracy: number | null
    readonly heading: number | null
    readonly latitude: number
    readonly longitude: number
    readonly speed: number | null
  }

  type latlng = {lat:number, lng: number}
  type Geolocalisation = {
    plus_code: {
        compound_code:string,
        global_code:string
    }
    results:{
        address_components: {
            long_name:string,
            short_name:string,
            types:string[]
        }[],
        formatted_address: string,
        geometry: {
            location: latlng,
            location_type : string
            viewport: {
                northeast: latlng
                southwest: latlng
            }
        },
        navigation_points: {location:latlng }[],
        place_id:string,
        plus_code: {
            compound_code:string,
            global_code:string
        },
        types : string[]
    }[]
    status:string
  }

    interface Client {
        pseudo: string;
        roomName: string;
        initiator: boolean;
    }

    interface Room {
        clients: {
            [clientId: string]: Client;
        };
    }


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

    class GalleryImage {
        image:string;
        saved_at:string;
        constructor (image:string, saved_at:string) {
            this.image = image
            this.saved_at = saved_at
        }
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
}
