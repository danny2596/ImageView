var currBook;
var startTime=0;
var filterH,filterW;
var openMode=0;//openMode: 0=>Open Root dir or book; 1=>move target 1; 2=>move target 2; 3=>move target 3;
var moveTarget=[];
function onInit(){
	onWindowResize();
}
function dirOpened(obj){
	if(obj === undefined){
		if( typeof(gDir) === 'undefined' )
			return;
		else
			dir=gDir;
	}else{
		dir=obj;
	}
	if(openMode===0)
		openRootDir(dir);
	else
		openMoveTarget(dir,openMode);

	openMode=0;
}
function onWindowResize(){
	pd(I,"@pic.js >> onWindowResize Start");
	let winH= window.innerHeight;
	let winW= window.innerWidth;
	filterH = winH-30;
	filterW=winW;
	$('.pic-filter').css('height',filterH);
	showImg();
	pd(I,"@pic.js >> onWindowResize end");
}
function onDestroy(){

}
function openRootDir(obj){
	let dir=obj;
	pd("i","@pic.js > openRootDir start");
	
	pd(I,"@pic.js > openRootDir > open book, root dirArr.length="+dir.dirArr.length+", fileArr.length="+dir.fileArr.length);

	try{
		if(dir.dirArr.length>0 && dir.fileArr.length===0){
			let bookPath=mergePath(dir.dirPath,dir.dirArr[0]);
			dir.currDir=0;
			gDir=dir;
			let book = readDir(bookPath);
			openBook(book);
		}else if(dir.fileArr.length>0){
			//get parent dir
			let parentPath = getParentPath(dir.dirPath);
			if(parentPath==null)
				return;
			//set up gDir
			gDir = readDir(parentPath);
			let idx = gDir.dirArr.indexOf(getName(dir.dirPath));
			gDir.currDir=idx;
			//openBook
			openBook(dir);
		}
	}catch(e){
		pd('e',"@pic.js > openRootDir > open book ERROR : "+e.message);
	}
}
function openBook(dir){
	let msg = "";
	currBook=dir;
	//1. check is nature sort
	let tmp = dir.fileArr.slice(0);
	tmp.sort();
	if(stringArrayCmp(tmp,dir.fileArr)){
		pd(I,"@pic.js >> open book; equals");
	}
	else{
		msg += "<div class='alpha'>Alpha</div>";
		pd(I,"@pic.js >> open book; not equals");
	}
	//2. check has dir insite
	if(dir.dirArr.length>0){
		msg+="<div class='subdir'>SubDIR</div>";
	}
	//3. remove non-image file
	let imgOnly=[];
	let hasNonImg=false;
	for(let i=0;i<dir.fileArr.length;i++){
		let fname=dir.fileArr[i];
		if(isImage(fname)){
			imgOnly.push(fname);
		}else{
			hasNonImg=true;
		}
	}
	dir.fileArr=imgOnly;
	if(hasNonImg){
		msg+="<div class='non-img'>NonImg</dev>";
	}
	//4. put book info
	if(dir.fileArr.length===0){
		msg+='<div class="bookinfo" id="book-info">NO IMAGE CAN SHOW</div>';
	}
	else{
		let bookName=getName(dir.dirPath);
		currBook.bookName=bookName;
		msg+='<div class="bookinfo" id="book-info">'+bookName+' [1/'+dir.fileArr.length+']</div>';
		msg+='<div class="bookinfo" id="uTime"></div>'
	}
	
	//5. show info message
	let info = $('#info');
	info.empty();
	info.append(msg);

	//6.show image
	currBook.currFile=0;
	startTime=0;
	if(currBook.fileArr.length>0)
		showImg();
}
function showImg(){
	pd(I,"@pic.js >> showImg, start");
	if(startTime!==0){
		pd(I,"@pic.js >> showImg, startTime="+startTime+", return");
		return;
	}

	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	startTime = new Date().getTime();
	$('#pic-filter').empty();
	pd(I,"@pic.js >> showImg, empty");
	let imgPath=mergePath(currBook.dirPath,currBook.fileArr[currBook.currFile]);
	// if(currBook.dirPath[currBook.dirPath.length-1]==='\\'){
	// 	imgPath=currBook.dirPath+currBook.fileArr[currBook.currFile];
	// }else{
	// 	imgPath=currBook.dirPath+'\\'+currBook.fileArr[currBook.currFile];
	// }
	pd(I,"@pic.js >> showImg, img path="+imgPath);
	let imgstr="<img src='"+winPath2FileURL(imgPath)+"'>";
	pd(I,"@pic.js >> showImg, imgstr="+imgstr);
	let img=$(imgstr);
	pd(I,"@pic.js >> showImg, create img elem");
	img.css('display','none');
	img.load(function(event){
		let uTime = new Date().getTime() - startTime;
		if(startTime !==0){
			pd(I,"@pic.js >> showImg, img on load usage time = "+uTime+" ms");
		}else{
			pd(I,"@pic.js >> showImg, img on load ,startTime=0 something error");
		}
		let imgH = this.naturalHeight;
		let imgW = this.naturalWidth;
		let elem=$(this);
		pd(I,"@pic.js >> showImg, get elem, W="+imgW+", H="+imgH);
		let tmp =filterW-(imgW*(filterH/imgH));
		if(tmp>0){
			elem.css('height','100%');
		}else{
			elem.css('width','100%');
		}
		elem.css('display','initial');
		$('#uTime').text(uTime+'ms');
		startTime=0;
	});
	$('#pic-filter').append(img);

}
function prevBook(){
	pd(I,"@pic.js > preBook start");
	if(typeof(gDir)==='undefined' || typeof(gDir.currDir) === 'undefined')
	{
		pd(I,'@pic.js > prebook ; gDir or gDir.currDir is undefined')
		return;
	}
	if(gDir.currDir===0){
		alert('No Prev Book');
		return;
	}
	gDir.currDir--;
	let bookPath =mergePath(gDir.dirPath,gDir.dirArr[gDir.currDir]);
	pd(I,'@pic.js > prevBook ; bookPath = '+bookPath);
	openBook(readDir(bookPath));
}
function nextBook(){
	pd(I,"@pic.js > nextBook start");
	if(typeof(gDir)==='undefined' || typeof(gDir.currDir) === 'undefined')
	{
		pd(I,'@pic.js > nextBook ; gDir or gDir.currDir is undefined')
		return;
	}

	if(gDir.currDir===gDir.dirArr.length-1){
		alert('No Next Book');
		return;
	}
	gDir.currDir++;
	let bookPath = mergePath(gDir.dirPath,gDir.dirArr[gDir.currDir]);
	pd(I,'@pic.js > nextBook ; bookPath = '+bookPath);
	openBook(readDir(bookPath));
}
function prevPage(){
	pd(I,"@pic.js > prevPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile--;
	if(currBook.currFile === -1){
		currBook.currFile++;
		pd(I,"@pic.js > prevPage; no prev Page");
		alert('No Prev Page');
		return;
	}
	$('#book-info').text(currBook.bookName+' ['+(currBook.currFile+1)+'/'+currBook.fileArr.length+']');
	showImg();


}
function nextPage(){
	pd(I,"@pic.js > nextPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile++;
	if(currBook.currFile === currBook.fileArr.length){
		currBook.currFile--;
		pd(I,"@pic.js > nextPage; no next Page");
		alert('No Next Page');
		return;
	}
	$('#book-info').text(currBook.bookName+' ['+(currBook.currFile+1)+'/'+currBook.fileArr.length+']');
	showImg();
}
function firstPage(){
	pd(I,"@pic.js > firstPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile=0;
	$('#book-info').text(currBook.bookName+' ['+(currBook.currFile+1)+'/'+currBook.fileArr.length+']');
	showImg();
}
function lastPage(){
	pd(I,"@pic.js > lastPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile=currBook.fileArr.length-1;
	$('#book-info').text(currBook.bookName+' ['+(currBook.currFile+1)+'/'+currBook.fileArr.length+']');
	showImg();
}
function deletePage(){
	//copy src path and name
	
	//remove name form currBook.fileArr
	
	//check currfile is out of range or not
	
	//showImage()
	
	// process backup name
	
	//use fs move file to back dir
	
}
function moveBook(target){
	if(typeof(moveTarget[target]) !== 'string' ||moveTarget[target].length===0 ){
		pd(I,'@pic.js > moveBook; return, typeof(moveTarget[target])='+typeof(moveTarget[target]));
		askTargetDirPath(target);
		return;
	}

	//copy src path and name
	let srcPath = currBook.dirPath;
	let dstPath = mergePath(moveTarget[target], getName(currBook.dirPath));
	pd(I,'@pic.js > moveBook srcPath='+srcPath+", dstPath="+dstPath);
	
	//remove name form gDir.dirArr
	if(typeof(gDir)==='undefined'){
		pd(I,'@pic.js > moveBook; return, gDir is undefined');
		return;
	}
	if(typeof(gDir.dirArr)==='undefined'){
		pd(I,'@pic.js > moveBook; return, gDir.dirArr is undefined');
		return;
	} 
	if(gDir.dirArr[gDir.currDir] !==getName(currBook.dirPath)){
		pd(I,'@pic.js > moveBook; return, currbook='+getName(currBook.dirPath));
		pd(I,'@pic.js > moveBook; return, gDir.currDir='+gDir.currDir+', bookname='+gDir.dirArr[gDir.currDir]);
		return;
	}
	if(checkStatus(dstPath)!==NOT_EXISTS){
		alert(dstPath+' is exists');
	}

	//confirm
	if(!confirm("Do you want move "+getName(currBook.dirPath)+ ' to '+moveTarget[target]+'?')){
		return;
	}

	gDir.dirArr.splice(gDir.currDir,1);
	
	//check currDir is out of range or not
	if(gDir.currDir === gDir.dirArr.length){
		gDir.currDir--;
	}

	//open book
	if(gDir.currDir !== -1){
		let bookPath = mergePath(gDir.dirPath,gDir.dirArr[gDir.currDir]);
		openBook(readDir(bookPath));
	}else{
		$('#pic-filter').empty();
	}
	
	
	//use fs rename to target
	moveDir(srcPath,dstPath);

	if(gDir.currDir === -1)
	{
		alert('No more Book');
	}
}
function askTargetDirPath(mode){
	if(openMode!==0)
		return;
	openMode=mode;
	ipc.send('open-file-dialog');
}
function openMoveTarget(dir,mode){
	//getted target dir
	//save path.
	let path = dir.dirPath;
	pd(I,'@pic.js > locateTest > path:'+path);
	if(path[path.length-1]==='\\')
		moveTarget[mode]=path;
	else
		moveTarget[mode]=path+'\\';
}
function locateTest(){
	var r=confirm("confirm!!!");
	if(r===true){
		pd(I,'@pic.js > locateTest > confirm true');
	}else{
		pd(I,'@pic.js > locateTest > confirm false');
	}
	try{
		let path = __dirname;
		pd(I,'@pic.js > locateTest > path:'+path);
	}catch(e){
		pd('e','@pic.js > locateTest > ERROR:'+e.message);
	}

}
function onKeydownEvent(key){
	
	switch(key){
		case 38:
			//up
			prevPage();
			break;
		case 40:
			//down
			nextPage();
			break;
		case 37:
			//left
			locateTest();
			break;
		case 39:
			//right
			break;
		case 219:
			//[
			prevBook();
			break;
		case 221:
			//]
			nextBook();
			break;
		case 33:
			//page up
			prevPage();
			break;
		case 34:
			//page down
			nextPage();
			break;
		case 35:
			//end
			lastPage();
			break;
		case 36:
			//home
			firstPage();
			break;
		case 46:
			//delete
			deletePage();
			break;
		case 49:
			//1
			askTargetDirPath(1);
			break;
		case 50:
			//2
			askTargetDirPath(2);
			break;
		case 51:
			//3
			askTargetDirPath(3);
			break;
		case 81:
			//q
			moveBook(1);
			break;
		case 87:
			//w
			moveBook(2);
			break;
		case 69:
			//e
			moveBook(3);
			break;	
	}
}//end of onKeydownEvent