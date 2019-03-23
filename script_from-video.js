var all_frames=[];
const yolo = ml5.YOLO(modelLoaded,{ filterBoxesThreshold: 0.01, IOUThreshold: 0.01, classProbThreshold: 0.5 });
function fromVideo(){
    var video = document.createElement("video");
    video.height=400;
    video.width=video.height*1.774;
    video.crossOrigin="Anonymous";
    video.addEventListener('loadeddata', function() {
        if (!isNaN(video.duration)) {
            video.currentTime = 0;
        }
    }, false);

    video.addEventListener('seeked', function() {
        var canvas = document.createElement('canvas');
        canvas.setAttribute('id', video.currentTime);
        canvas.width = video.width;
        canvas.height = video.height;
        var context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        all_frames.push(canvas);
        if(video.currentTime<video.duration){
            video.currentTime += 0.1;
        }else{
            startDetecting();
        }
    }, false);

    var playSelectedFile = function(event) {
        var file = this.files[0];
        var fileURL = URL.createObjectURL(file);
        video.src = fileURL;
        document.getElementById("frames").innerHTML='';
    }

    var input = document.querySelector('input');
    input.addEventListener('change', playSelectedFile, false);
}
function modelLoaded() {
  $('#ready_state').css('visibility','visible');
  console.log('Model Loaded!');
}
var i=0;
var all_output=[];
function startDetecting(){
  yolo.detect(getImg(all_frames[i]),function(err, results){
    var context = all_frames[i].getContext("2d");
    for(var j=0; j<results.length; j++){
      context.font = "13px Arial";
      context.fillText(results[j].className +" ("+Math.round(results[j].classProb*100)+"%)", results[j].x*all_frames[i].width, results[j].y*all_frames[i].height-2);
      context.rect(results[j].x*all_frames[i].width, results[j].y*all_frames[i].height, results[j].w*all_frames[i].width, results[j].h*all_frames[i].height);
    }
    context.stroke();
    all_output.push(results);
    $('#progress').css('width', i/(all_frames.length-1) * window.innerWidth +'px');
    document.getElementById("frames").appendChild(all_frames[i]);
    i++;
    if(i<all_frames.length){
      startDetecting(i);
    }else{
      console.log(all_output);
      $('#progress').css('width', '0px');
    }    
  });
}

function getImg(canvas) {
  var image = new Image();
  image.width=canvas.width;
  image.height=canvas.height;
	image.src = canvas.toDataURL("image/png");
	return image;
}