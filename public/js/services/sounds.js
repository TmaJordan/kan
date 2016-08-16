angular.module('kanApp').factory('Sounds', [function(){
    //Plays sounds in application, used when task is completed
    var Sounds = {
        ding: new Audio('audio/ding.wav')
    }
    
    Sounds.play = function(soundName) {
        if (Sounds[soundName]) {
            Sounds[soundName].play();
        }
    }

    return Sounds;
}]);
