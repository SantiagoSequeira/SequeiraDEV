var isRotated = false;
var tooltips = document.querySelectorAll('.tooltip span');
var image = document.getElementById('image-show');
var main = document.getElementById('main');
var tooltip = document.getElementById('tooltip');
var container = document.getElementById('container');
var limits = main.getBoundingClientRect();
var imagemain = document.getElementById('mainimage');



var checkLimits = () => {
	limits = main.getBoundingClientRect();
	var h = (isRotated) ? limits.width + 'px' : limits.height +'px',
		w = (isRotated) ? limits.height + 'px' : limits.width + 'px';
	tooltip.style.width = w;
	tooltip.style.height = h;
	container.style.width = w;
	container.style.height = h;
	mainimage.style.width = w;
	mainimage.style.height = h;
}

function rotate(srcBase64, degrees, callback) {
  const canvas = document.createElement('canvas');
  let ctx = canvas.getContext("2d");
  let image = new Image();

  image.onload = function () {
    canvas.width = degrees % 180 === 0 ? image.width : image.height;
    canvas.height = degrees % 180 === 0 ? image.height : image.width;

    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(degrees * Math.PI / 180);
    ctx.drawImage(image, image.width / -2, image.height / -2);

    callback(canvas.toDataURL());
  };

  image.src = srcBase64;
}
function toDataUrl(url, callback) {
    var xhr = new XMLHttpRequest();
    xhr.onload = function() {
        var reader = new FileReader();
        reader.onloadend = function() {
            callback(reader.result);
        }
        reader.readAsDataURL(xhr.response);
    };
    xhr.open('GET', url);
    xhr.responseType = 'blob';
    xhr.send();
}

var rotateImage = (left) => {
	isRotated = true;
	toDataUrl(imagemain.attributes.src.value, function(myBase64) {
	    rotate(myBase64, (left) ? -90 : 90, function(resultBase64) {
		  imagemain.setAttribute('src', resultBase64);
		  image.style.backgroundImage = 'url(' + resultBase64 + ')'; 
		});
		
	});
	checkLimits();
}
checkLimits();
tooltip.onmousemove = function (e) {
    var mX = e.pageX,
        mY = e.pageY,
        iX = limits.left,
        iY = limits.top;
	var x = mX - (iX),
		y = mY - (iY)
		w = (isRotated) ? limits.height:limits.width,
		h = (isRotated) ? limits.width:limits.height;
	var xP = (-x / w) * -100,
	 	yP = (-y / h) * -100;
 	var offsetX = 100-(x * 200 / w ),
 		offsetY = 100-(y * 200 / h );
	if(mX < iX || x > w || mY < iY || y > h) {
		tooltips[0].style.display = 'none';
	} else {
		tooltips[0].style.display = 'block';

	}
	tooltips[0].style.top = y+ 'px';
	tooltips[0].style.left = x + 'px';
	image.style.backgroundPosition = 'calc(' + xP + '% - '+ -offsetX +'px) calc(' + yP + '% - '+ -offsetY + 'px)';
};