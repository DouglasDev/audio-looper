// Import Vue
import Vue from 'vue';

// Import F7
import Framework7 from 'framework7/framework7.esm.bundle.js';

// Import F7 Vue Plugin
import Framework7Vue from 'framework7-vue/framework7-vue.esm.bundle.js';

// Import F7 Styles
import 'framework7/css/framework7.bundle.css';

// Import Icons and App Custom Styles
import IconsStyles from './css/icons.css';
import AppStyles from './css/app.css';

// import Tone from 'tone';
// import {Howl, Howler} from 'howler';
// import {Tock} from 'tocktimer';


// Import App Component
import App from './app.vue';

// Init F7 Vue Plugin
Framework7.use(Framework7Vue)

// Init App
new Vue({
  el: '#app',
  template: '<app/>',

  // Register App Component
  components: {
    app: App
  },
  created(){
	  	(function() {

		var promisifiedOldGUM = function(constraints, successCallback, errorCallback) {

			// First get ahold of getUserMedia, if present
			var getUserMedia = (navigator.getUserMedia ||
					navigator.webkitGetUserMedia ||
					navigator.mozGetUserMedia ||
					navigator.msGetUserMedia);

			// Some browsers just don't implement it - return a rejected promise with an error
			// to keep a consistent interface
			if(!getUserMedia) {
				return Promise.reject(new Error('getUserMedia is not implemented in this browser'));
			}

			// Otherwise, wrap the call to the old navigator.getUserMedia with a Promise
			return new Promise(function(successCallback, errorCallback) {
				getUserMedia.call(navigator, constraints, successCallback, errorCallback);
			});
			
		}

		// Older browsers might not implement mediaDevices at all, so we set an empty object first
		if(navigator.mediaDevices === undefined) {
			navigator.mediaDevices = {};
		}

		// Some browsers partially implement mediaDevices. We can't just assign an object
		// with getUserMedia as it would overwrite existing properties.
		// Here, we will just add the getUserMedia property if it's missing.
		if(navigator.mediaDevices.getUserMedia === undefined) {
			navigator.mediaDevices.getUserMedia = promisifiedOldGUM;
		}
		
	})();
	console.log(JSON.stringify(navigator.mediaDevices),JSON.stringify(navigator.mediaDevices.getUserMedia))
  }
});
