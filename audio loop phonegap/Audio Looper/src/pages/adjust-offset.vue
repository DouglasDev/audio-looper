<template>
	<f7-page>
    <f7-navbar title="Adjust Playback Offset" back-link="Back"></f7-navbar>  

	<p style="text-align: center">Detected Volume: {{this.outputVolume}}</p>
    <audio autoplay="false" controls="true" ref="audio" style="display:none;"></audio>
    <!-- <f7-block>  -->
<!--         <f7-button raised @click="startAdjusting" v-show="state=='noAdjusting'"
          >Start Adjusting</f7-button>
        <f7-button raised @click="stopAdjusting" v-show="state=='Adjusting'" :active="true"
          >Stop Adjusting</f7-button>
 -->    <!-- </f7-block>  -->
			<br>
	<f7-card
	  content="Make sure your speakers are on, the volume is set to a clearly audible level, and there is a minimal amount of ambient noise."
	></f7-card>

  </f7-page>
</template>

<script>
var SoundDetection = require('sound-detection');
  
export default{
		data(){
			return{
				state:'noAdjusting',
				interval:1,
				offset:.5,
		        reader: new FileReader(),
				blob:null,fileToSend:null,globalStream:null,rec:null,
				outputVolume:0
			}
		},
		created(){
			this.startStream()
		},
		destroy(){
			this.audioContext=null
		},
		methods:{
			startAdjusting(){
				this.state='Adjusting'
				console.log(Date.now())
				this.startStream();
			},
			stopAdjusting(){
				this.state='noAdjusting'
			},
			startStream(){
				navigator.mediaDevices.getUserMedia({ audio: true, video: false })
				.then((stream)=> {
					console.log('asdfsafd')
					this.$refs.audio.srcObject = stream
		        	this.rec = new MediaRecorder(stream);

				  this.audioContext = new AudioContext();
				  let analyser = this.audioContext.createAnalyser();
				  let microphone = this.audioContext.createMediaStreamSource(stream);
				  let javascriptNode = this.audioContext.createScriptProcessor(2048, 1, 1);

				  analyser.smoothingTimeConstant = 0.8;
				  analyser.fftSize = 1024;

				  microphone.connect(analyser);
				  analyser.connect(javascriptNode);
				  javascriptNode.connect(this.audioContext.destination);
				   javascriptNode.onaudioprocess = 
				  	()=>{
				      var array = new Uint8Array(analyser.frequencyBinCount);
				      analyser.getByteFrequencyData(array);
				      var values = 0;

				      var length = array.length;
				      for (var i = 0; i < length; i++) {
				        values += (array[i]);
				      }

				      var average = values / length;
				    // console.log(Math.round(average));
				    this.outputVolume=Math.round(average)
				  }

				  })
				  .catch(function(err) {
				  	// console.log(err)
				    /* handle the error */
				});

		  //     navigator.mediaDevices.getUserMedia({audio:true,video:false})
		  //     .then(stream => {
		  //     	console.log(stream)
		  //       this.globalStream=stream
		  //       this.$refs.audio.srcObject = stream
		  //       // this.rec = new MediaRecorder(stream);
		  //       console.log(this.rec)
		  //       this.detector = new SoundDetection({
				// 	    url: this.$refs.audio.srcObject,
				// 	    format: {
				// 	        bitDepth: 16,
				// 	        numberOfChannels: 1,
				// 	        signed: true
				// 	    },
				// 	    triggerLevel:30
				// 	}, 
				// 	(dB)=>{
				//     	console.log('Noise Detected at %sdB', dB);
				// 	}
				// );

		      // }).catch((e)=>{
		      //   console.log(e)
		      // })
		    },

		}
	}
</script>