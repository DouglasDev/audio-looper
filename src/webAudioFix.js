var audio_context = new window.AudioContext(),
    mic_stream;

var fix_webaudio = function(max_attempts, interval, a) {
    var attempt = a || 0;

    if (audio_context.baseLatency < 0.2) {
        if (attempt) {
            if (mic_stream) {
                mic_stream.getTracks()[0].stop();
                mic_stream = null;
            }
            window.alert(
                'Fixed WebAudio after ' + attempt + ' attempts, you ' +
                'may need to adjust your volume.'
            );
        }
        return audio_context;
    }

    if (!attempt) {
        if (!window.confirm(
            'It looks like you\'re using Bluetooth headphones which ' +
            'has broken WebAudio. Attempt to fix by turning the ' +
            'Bluetooth microphone on and off?'
        )) {
            return;
        }
        navigator.getUserMedia({audio: true}, function(s) {
            mic_stream = s;
        }, function() {});
    }

    if (attempt < max_attempts) {
        audio_context.close();
        audio_context = new window.AudioContext();
        setTimeout(function() {
            fix_webaudio(max_attempts, interval, attempt + 1);
        }, interval);
    } else {
        window.alert(
            'Failed to fix WebAudio after ' + attempt + ' attempts.'
        );
    }
};

fix_webaudio(20, 500);
