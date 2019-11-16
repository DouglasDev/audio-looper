<template>
    <Page>
        <StackLayout>
            <ActivityIndicator color="#3489db" :busy="isRecording" />
            <Button text="Start Recording" tap="start" />
            <Button text="Stop Recording" tap="stop" />
            <Button text="Get Recorded File" tap="getFile" />
            <label :text="recordedAudioFile" color="#3489db" textWrap="true" />
        </StackLayout>
    </Page>
</template>

<script >
    var observable = require("data/observable");
    var fs = require('file-system');
    var audio = require("nativescript-audio");
    var permissions = require('nativescript-permissions');
    var data = new observable.Observable({});
    var recorder;
     
export default {
    data() {
      return {
        msg: 'Hello World!',
        isRecording:false,
        recordedAudioFile:''
      }
    },
    methods:{     
        /* START RECORDING */
         
        start(args) {
         
           permissions.requestPermission(android.Manifest.permission.RECORD_AUDIO, "Let me hear your thoughts...")
         .then(function () {
         
           // you should check if the device has recording capabilities
           if (audio.TNSRecorder.CAN_RECORD()) {
         
             recorder = new audio.TNSRecorder();
         
             var audioFolder = fs.knownFolders.currentApp().getFolder("audio");
         
             var recorderOptions = {
         
               filename: audioFolder.path + '/recording.mp3',
               infoCallback:()=> {
                  console.log('infoCallback');
                },
               errorCallback:()=> {
                  console.log('errorCallback');
                  alert('Error recording.');
                }
             };
         
            console.log('RECORDER OPTIONS: ' + recorderOptions);
         
            recorder.start(recorderOptions).then((res)=> {
               // data.set('isRecording', true);
               this.isRecording=true
            }, function (err) {
                // data.set('isRecording', false);
                this.isRecording=false
                console.log('ERROR: ' + err);
            });
         
           } else {
             alert('This device cannot record audio.');
           }
         
          })
           .catch(function (e) {
              console.log("Uh oh, no permissions - plan B time!");
           });
        },
         
        /* STOP RECORDING */
         
        stop(args) {
           if (recorder != undefined) {
             recorder.stop().then(()=> {
             // data.set('isRecording', false);
             this.isRecording=false
             alert('Audio Recorded Successfully.');
           }, function (err) {
             console.log(err);
             // data.set('isRecording', false);
             this.isRecording=false
           });
          }
        },
        getFile(args) {
         try {
            var audioFolder = fs.knownFolders.currentApp().getFolder("audio");
            var recordedFile = audioFolder.getFile('recording.mp3');
            // data.set("recordedAudioFile", recordedFile.path);
            this.recordedAudioFile=recordedFile.path
          } catch (ex) {
            console.log(ex);
          }
        }
    }
  }
</script>

<style scoped>
    ActionBar {
        background-color: #53ba82;
        color: #ffffff;
    }

    .message {
        vertical-align: center;
        text-align: center;
        font-size: 20;
        color: #333333;
    }
</style>
