var currBook;
var startTime=0;
var filterH,filterW;
var openMode=0;
var moveTarget=[];
var backup = "";
moveTarget[0] = "";
moveTarget[1] = "";
moveTarget[2] = "";
moveTarget[3] = "";

////////////////////////////////////////////////////////////////////////////////////////
///             page  basic control                                                 ////
////////////////////////////////////////////////////////////////////////////////////////
function onInit(){
	onWindowResize();
	checkConfig();
	initInfoBar();
}

function onWindowResize(){
	// pd(I,"@pic.js >> onWindowResize Start");
	let winH= window.innerHeight;
	let winW= window.innerWidth;
	filterH = winH-30;
	filterW=winW;
	$('.pic-filter').css('height',filterH);
	$('#file-management').css('height',winH);
	showImg();
	// pd(I,"@pic.js >> onWindowResize end");
}

function onDestroy(){

}

function initInfoBar(){
	let info = $('#info');
	info.empty();

	let alpha=$("<div class='alpha' id='alpha'>Alpha</div>");
	alpha.hide();
	info.append(alpha);

	let subdir = $("<div class='subdir' id='subdir'>SubDIR</div>");
	subdir.hide();
	info.append(subdir);

	let nonImg = $("<div class='non-img' id='nonImg'>NonImg</dev>");
	nonImg.hide();
	info.append(nonImg);

	let bookinfo = $('<div class="bookinfo" id="book-info"></div>');
	info.append(bookinfo);

	let uTime = $('<div class="rightCell" id="uTime"></div>');
	info.append(uTime);

	let bookIndex = $('<div class="rightCell" id="bookIndex"></div>');
	info.append(bookIndex);

	let pageIndex = $('<div class="rightCell" id="pageIndex"></div>');
	info.append(pageIndex);
}

function askTargetDirPath(mode){
	if(openMode!==0)
		return;
	openMode=mode;
	ipc.send('open-file-dialog');
}

function openBackupDir(dir){
	let path = dir.dirPath;
	if(path[path.length-1]==='\\')
		backup=path;
	else
		backup=path+'\\';
}

function openMoveTarget(dir,mode){
	//getted target dir
	//save path.
	let path = dir.dirPath;
	//pd(I,'@pic.js > locateTest > path:'+path);
	if(path[path.length-1]==='\\')
		moveTarget[mode]=path;
	else
		moveTarget[mode]=path+'\\';
}

function locateTest(){
	
	try{
		let path = __dirname;
		pd(I,'@pic.js > locateTest > path:'+path);
	}catch(e){
		pd('e','@pic.js > locateTest > ERROR:'+e.message);
	}
	//swal('Sweet Alert test');
	SW("test",'something line1\nline2');

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
		case 32:
			//space
			nextPage();
			break;
		case 37:
			//left
			// deleteNonImageFiles();
			fixAlphaSort();
			break;
		case 39:
			//right
			typeOfCharInUnicode(12540);
			break;
		case 83: //s
		case 219:
			//[
			prevBook();
			break;
		case 68: //d
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
		case 81: //q
		case 45: // insert
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
		case 27:
			$('img').hide();
			break;
	}
}//end of onKeydownEvent


////////////////////////////////////////////////////////////////////////////////////////
///             book control                                                        ////
////////////////////////////////////////////////////////////////////////////////////////
function check_gDir(){
	if(typeof(gDir)==='undefined')
		return false;

	return true;
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
	else if(openMode===-1)
		openBackupDir(dir);
	else
		openMoveTarget(dir,openMode);

	openMode=0;
}

function openRootDir(obj){
	let dir=obj;
	// pd("i","@pic.js > openRootDir start");
	
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
	let msg = [];
	let bookName=getName(dir.dirPath);
	let info = $('#info');

	currBook=dir;
	if(!check_gDir()){
		return;
	}
	$("#bookIndex").text("Book "+(gDir.currDir+1)+"/"+gDir.dirArr.length);

	// check is nature sort
	let tmp = dir.fileArr.slice(0);
	tmp.sort();
	if(!stringArrayCmp(tmp,dir.fileArr)){
		$('#alpha').show();
		msg.push("Using Alpha Sort");
	}else{
		$('#alpha').hide();
	}
		
	// check has dir insite
	if(dir.dirArr.length>0){
		$('#subdir').show();
		msg.push("Has Sub-Directory");
	}else{
		$('#subdir').hide();
	}

	// remove non-image file
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
	dir.imgArr=imgOnly;
	if(hasNonImg){
		$('#nonImg').show();
		msg.push("Has Non-image file");
	}else{
		$('#nonImg').hide();
	}

	// put book info
	if(dir.fileArr.length===0){
		$("#book-info").text("NO Image CAN SHOW in "+bookName);
	}
	else{
		currBook.bookName=bookName;
		$("#book-info").text(bookName);
		$("#pageIndex").text("Page 1/"+currBook.fileArr.length);
	}	

	//show image
	currBook.currFile=0;
	startTime=0;
	if(currBook.fileArr.length>0)
		showImg();

	if(msg.length>0){
		SW('Book',msg.join('\n'));
	}
}

function prevBook(){
	// pd(I,"@pic.js > preBook start");
	if(typeof(gDir)==='undefined' || typeof(gDir.currDir) === 'undefined')
	{
		pd(I,'@pic.js > prebook ; gDir or gDir.currDir is undefined')
		return;
	}
	if(gDir.currDir===0){
		SW('No Prev Book');
		return;
	}
	gDir.currDir--;
	let bookPath =mergePath(gDir.dirPath,gDir.dirArr[gDir.currDir]);
	// pd(I,'@pic.js > prevBook ; bookPath = '+bookPath);
	openBook(readDir(bookPath));
}

function nextBook(){
	// pd(I,"@pic.js > nextBook start");
	if(typeof(gDir)==='undefined' || typeof(gDir.currDir) === 'undefined')
	{
		pd(I,'@pic.js > nextBook ; gDir or gDir.currDir is undefined')
		return;
	}

	if(gDir.currDir===gDir.dirArr.length-1){
		SW('No Next Book');
		return;
	}
	gDir.currDir++;
	let bookPath = mergePath(gDir.dirPath,gDir.dirArr[gDir.currDir]);
	// pd(I,'@pic.js > nextBook ; bookPath = '+bookPath);
	openBook(readDir(bookPath));
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
	moveDirOrFile(srcPath,dstPath);

	if(gDir.currDir === -1)
	{
		alert('No more Book');
	}
}

////////////////////////////////////////////////////////////////////////////////////////
///             book page control                                                   ////
////////////////////////////////////////////////////////////////////////////////////////
function showImg(){
	// pd(I,"@pic.js >> showImg, start");
	// if(startTime!==0){
	// 	pd(I,"@pic.js >> showImg, startTime="+startTime+", return");
	// 	return;
	// }

	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	startTime = new Date().getTime();
	//$('#pic-filter').empty();
	//pd(I,"@pic.js >> showImg, empty");
	let imgPath=mergePath(currBook.dirPath,currBook.fileArr[currBook.currFile]);
	
	// pd(I,"@pic.js >> showImg, img path="+imgPath);
	let imgstr="<img src='"+winPath2FileURL(imgPath)+"'>";
	//pd(I,"@pic.js >> showImg, imgstr="+imgstr);
	let img=$(imgstr);
	img.data("st",startTime);
	img.data("idx",currBook.currFile);
	// pd(I,"@pic.js >> showImg, create img elem, loading...");
	img.css('display','none');
	$('#uTime').text("Loading...");
	$('#info').css('background-color', '#E6CAFF');
	img.load(function(event){
		let elem=$(this);
		
		let imgH = this.naturalHeight;
		let imgW = this.naturalWidth;
		
		// pd(I,"@pic.js >> showImg, image W="+imgW+", H="+imgH);
		let tmp =filterW-(imgW*(filterH/imgH));
		if(tmp>0){
			elem.css('height','100%');
		}else{
			elem.css('width','100%');
		}

		if(currBook.currFile === elem.data("idx")){
			$('[data-img-shown]').remove();
			elem.css('display','initial');
		}
		elem.attr('data-img-shown','true');
			
		
		let uTime = new Date().getTime() - elem.data("st");
		if(startTime !==0){
			// pd(I,"@pic.js >> showImg, img on load usage time = "+uTime+" ms");
		}else{
			pd(I,"@pic.js >> showImg, img on load ,startTime=0 something error");
		}
		$('#uTime').text(uTime+'ms');
		$('#info').css('background-color', '#ffffff');
		startTime=0;
	});
	$('#pic-filter').append(img);

}

function prevPage(){
	// pd(I,"@pic.js > prevPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile--;
	if(currBook.currFile === -1){
		currBook.currFile++;
		pd(I,"@pic.js > prevPage; no prev Page");
		SW('No Prev Page');
		return;
	}
	$('#pageIndex').text('Page '+(currBook.currFile+1)+'/'+currBook.fileArr.length);
	showImg();


}

function nextPage(){
	// pd(I,"@pic.js > nextPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile++;
	if(currBook.currFile === currBook.fileArr.length){
		currBook.currFile--;
		pd(I,"@pic.js > nextPage; no next Page");
		SW('No Next Page');
		return;
	}
	$('#pageIndex').text('Page '+(currBook.currFile+1)+'/'+currBook.fileArr.length);
	showImg();
}

function firstPage(){
	// pd(I,"@pic.js > firstPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile=0;
	$('#pageIndex').text('Page '+(currBook.currFile+1)+'/'+currBook.fileArr.length);
	showImg();
}

function lastPage(){
	// pd(I,"@pic.js > lastPage start");
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	currBook.currFile=currBook.fileArr.length-1;
	$('#pageIndex').text('Page '+(currBook.currFile+1)+'/'+currBook.fileArr.length);
	showImg();
}

function deletePage(){
	if(typeof(currBook)==='undefined' || typeof(currBook.currFile) === 'undefined')
		return;
	
	let name = currBook.fileArr[currBook.currFile];

	if(!confirm("Do you want move ["+name+"] to "+backup+'?')){
		return;
	}

	//remove file
	if(!moveFile(name)){
		return;
	}
	
	//remove name form currBook.fileArr
	currBook.fileArr.splice(currBook.currFile,1);
	
	//check currfile is out of range or not
	if(currBook.currFile===currBook.fileArr.length){
		currBook.currFile--;
	}
	if(currBook.currFile===-1){
		alert('No more Page');
		return;
	}
	try{
		showImg();	
	}catch(e){
		pd("e","showImage failed");
	}
	
}

function moveFile(name){
	if(typeof(name) !== 'string')
		return false;
	// check backup dir is set or not
	if(typeof(backup)==='undefined' || backup.length===0){
		openMode=-1;
		ipc.send('open-file-dialog');
		return false;
	}
	let src = mergePath(currBook.dirPath,name);
	let bookName=getName(currBook.dirPath);

	//process backup name
	if(bookName.length>20){
		bookName=bookName.substring(0,20)+'~';
	}
	pd(I,"bookname="+bookName);
	let dst = mergePath(backup,bookName+'_'+name);

	//check state
	if(checkStatus(dst)!==NOT_EXISTS){
		let nameCount=0;
		do{
			if(nameCount===100)
				return false;
			nameCount++;
			dst = mergePath(backup,bookName+'_'+nameCount+'_'+name);
		}while(checkStatus(dst)!==NOT_EXISTS);
	}

	moveDirOrFile(src,dst);
	return true;
}

////////////////////////////////////////////////////////////////////////////////////////
///             problem fix (alpha sort, non image file)                            ////
////////////////////////////////////////////////////////////////////////////////////////

function deleteNonImageFiles(){
	// show another images
	// hide top-bar, and pic
	$('#pic-filter').hide();
	$('#top-bar').hide();
	$('#file-management').show();
	// create table in list-table
	createTable('nonImg');
}

function fixAlphaSort(){
	// show another images
	// hide top-bar, and pic
	$('#pic-filter').hide();
	$('#top-bar').hide();
	$('#file-management').show();
	// create table in list-table
	createTable('alpha');
	showTableRows('alpha');
}

function backToShowImage(){
	$('#pic-filter').show();
	$('#top-bar').show();
	$('#file-management').hide();
	$("#list-table").empty();
}

function fileManagementApply(){
	pd("fileManagementApply start");

	backToShowImage();
	pd("fileManagementApply end");
}

function fileManagementCancel(){
	pd("fileManagementCancel start");

	backToShowImage();
	pd("fileManagementCancel end");
}

function createTable(type){
	let simpleTable = "";
	if(type == 'nonImg'){
		// delete non image files
		simpleTable = 
		"<table class='fm-table'>\
			<thead>\
				<tr>\
					<th>delete</th>\
					<th>file name</th>\
				</tr>\
			</thead>\
			<tbody id='data-table'></tbody>\
		</table>";
	}else{
		// alpha sort
		simpleTable = "<table class='fm-table' id='tooltable'><tbody></tbody></table>";
		simpleTable += 
		"<table class='fm-table'>\
			<thead>\
				<tr>\
					<th>rename</th>\
					<th>review</th>\
				</tr>\
			</thead>\
			<tbody id='data-table'></tbody>\
		</table>"
	}
	$('#list-table').append(simpleTable);
}
function showTableRows(type){
	if(type == 'alpha'){
		pd("called by fix alpha sort");
	}
	//get file list
	pd('print obj currBook');
	pd(currBook);
	//compare common sort and alpha sort
	//
}
