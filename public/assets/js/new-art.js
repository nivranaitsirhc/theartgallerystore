// functions
function selectDOM(str){
	return document.querySelector(str);
}
// declaration
let artType = selectDOM('#artType'),
	artTypeNameTemp = '',
	artTypeOthers = selectDOM('#artTypeOthers-Container'),
	artTypeOthersName = selectDOM('#artTypeOthers'),
	imageUploadInput = selectDOM('#imageUploadInput'),
	imageUrlInput = selectDOM('#imageUrlInput');
	containerImageUpload = selectDOM('#containerImageUpload'),
	containerImageUrl = selectDOM('#containerImageUrl');
// events
artType.addEventListener('change',e=>{
	if(JSON.parse(e.target.value).index === 3){
		artTypeOthers.style = 'display:block;';
		artTypeOthersName.required = true;
		artTypeOthersName.value = artTypeNameTemp;
	} else {
		artTypeOthers.style = 'display:none;';
		artTypeOthersName.required = false;
		artTypeOthersName.value = '';
	}
});
artTypeOthersName.addEventListener('change',e=>{
	artTypeNameTemp = e.target.value;
});

imageUploadInput.addEventListener('change',e=>{
	selectDOM('#imgUploadText').innerText = imageUploadInput.value.replace(/^C:\\fakepath\\/, "");
});

function imgUpload(){
	containerImageUrl.style = "display:none;"
	imageUrlInput.required = false;
	containerImageUpload.style = "display:block;"
	imageUploadInput.required = true;
}
function imgUrl(){
	containerImageUrl.style = "display:block;"
	imageUrlInput.required = true;
	containerImageUpload.style = "display:none"
	imageUploadInput.required = false;
}