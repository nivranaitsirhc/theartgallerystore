// declaration
let artType = selectDOM('#artType'),
	artTypeNameTemp = '',
	artTypeOthersContainer = selectDOM('#artTypeOthersContainer'),
	artTypeOtherName = selectDOM('#artTypeOtherName'),
	artTypeSelect = selectDOM('#artTypeSelect'),
	imageUploadInput = selectDOM('#imageUploadInput'),
	imageUrlInput = selectDOM('#imageUrlInput');
	containerImageUpload = selectDOM('#containerImageUpload'),
	containerImageUrl = selectDOM('#containerImageUrl');
// events
// Display the "Other input box" for Type Other
artType.addEventListener('change',e=>{
	if(JSON.parse(e.target.value).index === 3){
		artTypeOthersContainer.style = '';
		artTypeOtherName.required = true;
		artTypeOtherName.value = artTypeNameTemp;
	} else {
		artTypeOthersContainer.style = 'display:none;';
		artTypeOtherName.required = false;
		artTypeOtherName.value = '';
	}
});
artTypeOtherName.addEventListener('change',e=>{
	artTypeNameTemp = e.target.value;
});
// update the upload path
imageUploadInput.addEventListener('change',e=>{
	selectDOM('#imgUploadText').innerText = imageUploadInput.value.replace(/^C:\\fakepath\\/, "");
});
// choose artType to display
artTypeSelect.addEventListener('change', e=>{

	if(artTypeSelect.value === "url"){
		imgUrl();
	} else if(artTypeSelect.value === "upload") {
		imgUpload();
	} else if(artTypeSelect.value === "none") {
		none();
	}
});

// fucntions
function none(){
	containerImageUrl.style = "display:none;"
	imageUrlInput.required = false;
	containerImageUpload.style = "display:none;"
	imageUploadInput.required = false;
}
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

