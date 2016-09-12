onDestroy=function(){

};
onInit=function(){
	onWindowResize();
	let node = $("#renameDIV");
	node.empty();
	node.append('<p onclick="openDirClick();" style="color:#EEE; border:1px solid; margin-left:20px; margin-right:20px; padding-top:10px; padding-bottom:10px; " >click to open dir</p>');
};
function onWindowResize(){
	pd("@rename.js >> onWindowResize Start");
	let winH= window.innerHeight;
	let winW= window.innerWidth;
	filterH = winH-30;
	filterW=winW;
	$('#renameDIV').css('height',filterH);
	pd("@rename.js >> onWindowResize end");
}
onKeydownEvent=function(code){
	pd("@rename.js onKeydownEventent; code = "+code);
	/*switch(code){

	}*/
};

function dirOpened(obj){
	pd("@rename.js dirOpened start;");
	if(!obj){
		//pd("error","@rename.js > dirOpened; obj is null");
		return;
	}
	console.dir(obj);
	let mainNode = $("#renameDIV").empty();
	let dirs = obj.dirArr;
	for(let name in dirs){
		if(typeof(dirs[name]) == 'string'){
			let dirNode = $("<p></p>");
			dirNode.text(dirs[name]);
			dirNode.addClass('dirNode');
			dirNode.on('click',openDir_rename);
			dirNode.data('path',mergePath(obj.dirPath,dirs[name]));
			mainNode.append(dirNode);
		}
	}
}

function openDir_rename(event){
	pd("@rename.js openDir_rename start;");
	let node = $(this);
	pd('point 1');
	let path = node.data('path');
	pd('point 2; '+path);
	let obj = readDir(path);
	console.dir(obj);

}

/*
流程
1. 開啟資料夾
2. 選擇目標資料夾
3. 顯示數量, 下一個資料夾
4. 進入遞迴處理
4-1. 列出資料夾數量, 檔案數量
4-2. 分區, 一區資料夾名稱, 一區檔案名稱
4-3. 進入下一個? 或是copy 回到上一層


 */