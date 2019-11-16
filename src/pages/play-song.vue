<style>
  .beats{
    line-height: initial;
    font-size: 28px;
    display: flex;
    flex-wrap: wrap;
    text-align: center;
    align-items: center;
    justify-content: center;
  }
</style>

<template>
  <f7-page>
    <f7-navbar title="Record Song" back-link="Back"></f7-navbar>  

    <f7-block strong v-if="loadingBlueTooth">
       <p>Attempting to load low-latency audio context...</p>
    </f7-block>

<!--     <f7-block strong v-if="Math.round(loadedPercent)<100">
      <p>Loading {{Math.round(loadedPercent)}}%</p>
      <p><f7-progressbar :progress="loadedPercent" id="demo-inline-progressbar"></f7-progressbar></p>
    </f7-block> -->
    <audio autoplay="false" controls="true" ref="audio" style="display:none;"></audio>

    <f7-block-title class='beats'>
      <span v-for="(beat,i) in beatsPerMeasure">
        {{i==currentBeat?'⬤ ':'◯ '}}
      </span>
    </f7-block-title>
     <f7-block-title style="text-align: center;">Metronome Volume</f7-block-title>
      <f7-block>
      <vue-slider
            v-model="volume"
            v-bind="volumeOptions"
            @change="changeMetronomeVolume"
      ></vue-slider><br>
        <f7-button raised @click="muteMetronome" :active="metronomeMuted"  
          >Mute Metronome</f7-button>
      </f7-block>

    <f7-block strong class="text-align-center" v-show="state!='recording'">
      <f7-row>
        <f7-col>
          <small class="display-block">BPM</small>
          <f7-stepper fill :value="initialBPM" :min="20" :max="300"
           :step="1" :autorepeat="true" :manual-input-mode="true"
           @stepper:change="setTempo">  
          </f7-stepper>
        </f7-col>
        <f7-col v-show="state=='noRecording'">
          <small class="display-block">Beats Per Measure</small>
          <f7-stepper fill :value="beatsPerMeasure"
           :min="1" :max="20" :step="1" :autorepeat="true" :manual-input-mode="true"
            @stepper:change="setBeatsPerMeasure"
           >  
          </f7-stepper>
        </f7-col>
        <f7-col v-show="state=='noRecording'">
          <small class="display-block">Pre-Roll Beats</small>
          <f7-stepper fill :value="preRollBeats"
           :min="1" :max="20" :step="1" :autorepeat="true" :manual-input-mode="true"
            @stepper:change="setPreRollBeats"
           >  
          </f7-stepper>
        </f7-col>
      </f7-row>
    </f7-block>


    <f7-block> 
        <f7-button raised @click="startRecording" v-if="state=='noRecording'"
          >Start Recording</f7-button><br>
        <f7-button raised @click="stopRecording" v-if="state=='recording'"
          >Stop Recording</f7-button><br>
        <f7-button raised @click="playBack" v-if="state=='finishedRecording'"
          >Play Back</f7-button><br>
        <f7-button raised @click="stopPlayBack" v-if="state=='finishedRecording'"
          >Stop</f7-button><br>
        <f7-button raised @click="deleteRecording" v-if="state=='finishedRecording'"
          >Delete Recording</f7-button>
    </f7-block> 

  </f7-page>
</template>

<script>
import VueSlider from 'vue-slider-component'
import 'vue-slider-component/theme/default.css'

import Recorder from 'recorderjs'
console.log(Recorder)
import Tone from 'tone';

let opened=false
export default{
  data(){
    return{
      state:'noRecording',
      loadingBlueTooth:false,
      songName:'',

      initialBPM:120,
      BPM:120,
      currentBeat:0,
      beatsPerMeasure:4,      
      preRollBeats:0,

      reader: new FileReader(),
      blob:null,fileToSend:null,globalStream:null,rec:null,

      baseOffset:.112,
      metronomeMuted:false,
      metronomeOffset:0,
      volume:5,
      volumeOptions:{
        dotSize: 25,
        height: 1,
        min: -10,
        max: 5,
        interval:.1,
        duration: 0.1,
        tooltip: 'none',
      },
    }
  },
  props:{
  },
  components:{
    VueSlider
  },
  computed:{
    beatsArray(){
      let beatLength=60/this.BPM
      let arr=[{time:0,sound:'high',index:0}]
      for (let i=1;i<this.beatsPerMeasure;i++){
        arr.push({time:i*beatLength,sound:'low',index:i})
      }
      return arr
    }
  },
  created(){
    if (this.mode=='bluetooth')this.fixBlueTooth()
      console.log('sdf'+navigator)
    this.loadMetronome()
    this.startStream()
  },
  mounted(){
    this.$refs.audio.muted=true   
  },
  beforeDestroy(){
    this.destroyAll()
  },
  // computed:{
  //   adjustedOffset(){
  //     console.log(this.metronomeOffset*this.initialBPM/this.BPM)
  //     return this.metronomeOffset*this.initialBPM/this.BPM
  //   }
  // },
  methods:{
    playBack(){
      // this.baseOffset=.15
      this.metronomeOffset=this.baseOffset*(this.initialBPM/Tone.Transport.bpm.value)**2
      console.log(this.metronomeOffset)
      document.addEventListener('keydown', (e)=>{
        if (e.code=='ArrowUp')this.baseOffset+=.001
        if (e.code=='ArrowDown')this.baseOffset-=.001
          this.metronomeOffset=this.baseOffset*(this.initialBPM/Tone.Transport.bpm.value)**2
          console.log(this.baseOffset,this.metronomeOffset)
      });

      // this.metronomeOffset=0
      this.$refs.audio.addEventListener('ended',()=>{Tone.Transport.stop()})
      this.$refs.audio.play()
      Tone.Transport.start("+0.0")
      // this.$refs.audio.addEventListener('play',()=>{Tone.Transport.start("+0.1")})
      // this.$refs.audio.play()
    },
    stopPlayBack(){
      Tone.Transport.stop()
      this.$refs.audio.pause()
      this.$refs.audio.currentTime=0
      this.currentBeat=0
    },
    deleteRecording(){
      // this.stopRecording()
      Tone.Transport.stop()
      this.currentBeat=0
      this.metronomeOffset=0
      this.$refs.audio.muted=true
      this.startStream()
      this.state="noRecording"
    },
    streamHandler(stream) {
      this.rec = new MediaRecorder(stream);

      this.rec.onstart = ()=> Tone.Transport.start("+0.0")
      this.rec.onstop = ()=> Tone.Transport.stop()

      this.rec.ondataavailable = e => {
        let audioChunks = [];
        audioChunks.push(e.data);
        if (this.rec.state == "inactive"){
          let blob = new Blob(audioChunks,{type:'audio/webm'});
          let fileToSend = this.blobToFile(blob, 'test.webm')
          this.$refs.audio.src = URL.createObjectURL(blob);
          this.$refs.audio.controls=true;
          this.$refs.audio.autoplay=false;
        }
      }
    },
    blobToFile(theBlob, fileName){
      theBlob.lastModifiedDate = new Date();
      theBlob.name = fileName;
      return theBlob;
    },
    startStream(){
      navigator.mediaDevices.getUserMedia({audio:true,video:false})
      .then(stream => {
        this.globalStream=stream
        this.$refs.audio.srcObject = stream
        this.streamHandler(stream)
      }).catch((e)=>{
        console.log(e)
      })
    },
    startRecording(){
      this.state="recording"
      this.metronomePart = new Tone.Part((time, value)=>{
        this[value.sound].start(time+this.metronomeOffset).stop(time+.2+this.metronomeOffset)
        Tone.Draw.schedule(()=>{
          this.currentBeat=value.index
        }, time+this.metronomeOffset)
      },this.beatsArray).start(0)

      this.metronomePart.loop=true
      this.metronomePart.loopStart=0
      this.metronomePart.loopEnd=(60/this.BPM)*this.beatsPerMeasure
      Tone.context.latencyHint = 'balanced'

      this.$refs.audio.srcObject = this.globalStream
      this.rec.start();

    },
    stopRecording(){
      this.rec.stop();
      this.currentBeat=0
      this.$refs.audio.muted=false
      this.$refs.audio.srcObject = undefined

      this.state="finishedRecording"
      // this.metronomePart.stop()
      // Tone.Transport.stop()
    },
    setPreRollBeats(beats){
      this.preRollBeats=beats
    },
    setBeatsPerMeasure(beats){
      this.beatsPerMeasure=beats
    },
    setTempo(tempo){
      // /Most browsers stop playing audio outside playbackRate bounds of 0.5 and 4, leaving the video playing silently. For most applications, it's recommended that you limit the range to between 0.5 and 4.
      //todo:get tempo during recording, make sure tempo stays in range after
      console.log(tempo,Tone.Transport.bpm.value,this.initialBPM*tempo)
      this.BPM=tempo
      this.$refs.audio.playbackRate=tempo/this.initialBPM
      Tone.Transport.bpm.value=tempo
    },
    async loadMetronome(){
      let lowSource = await import('../sounds/low.wav')
      this.low= new Tone.Player({"url" : lowSource.default}).toMaster();
      let highSource = await import('../sounds/high.wav')
      this.high= new Tone.Player({"url" : highSource.default}).toMaster();
    },
    fix_webaudio: async function(max_attempts, interval, a){
      var audio_context = new window.AudioContext(),
      mic_stream;
      return new Promise((resolve,reject)=>{
        var attempt = 0;
        while (attempt < max_attempts){
          if (!attempt) {
              audio_context = new window.AudioContext()
              navigator.getUserMedia({audio: true}, function(s) {
                  mic_stream = s;
              }, function() {});
          }
          else{
            audio_context.close();
            audio_context = new window.AudioContext();
          }
          attempt++
          if (audio_context && audio_context.baseLatency < 0.2) {
              if (attempt) {
                  if (mic_stream) {
                      mic_stream.getTracks()[0].stop();
                      mic_stream = null;
                  }
                  resolve(audio_context);
                  return
              }
          }
        }
        resolve(audio_context);
      });
    },
    fixBlueTooth: async function(){
      this.loadingBlueTooth=true
      Tone.context = await this.fix_webaudio(20, 500);
      this.loadingBlueTooth=false
      // console.log('Tone.context',Tone.context)
      this.loadSong()
    },
    changeMetronomeVolume(val,instrumentIndex){
      this.high.volume.value=val
      this.low.volume.value=val
    },
    changeGlobalVolume(vol){
      Tone.Master.volume.value=vol
    },
    changeGlobalTempo(tempo){
      this.tempoMultiplier=tempo
      this.tempoBPM=this.initialTempoBPM*tempo
      Tone.Transport.bpm.value=this.initialTempoBPM*tempo
    },
    muteMetronome(){
      this.metronomeMuted=!this.metronomeMuted
      this.high.mute=this.metronomeMuted
      this.low.mute=this.metronomeMuted
    }, 
    destroyAll: async function(){
      Tone.Transport.stop()
      this.metronomePart.stop()
      this.metronomePart=null
      this.low=null
      this.high=null
    },
  }
}
</script>