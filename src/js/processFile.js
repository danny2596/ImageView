const fs = require('fs');

/**
 * readDir use node.js model fs to read file/dir and return instance
 * @param  {[type]}
 * @return {dirArr:[],fileArr[],dirPath:string}
 */
function readDir(path){
	let files ={};
	files.dirArr=[]
	files.fileArr=[];
	files.dirPath=path;
	let list;
	try{
		list = fs.readdirSync(path);
	}catch(e){
		pd('e','readDir error:'+e.message);
		return;
	}
	if(list === null || list === undefined)
		return;
		
	let fullPath;
	let fileStat;	
	let file;
	for(let obj in list){
		file=list[obj];
		pd(I,'process '+file);
		fullPath = path+'\\' + file;
		try{
			if(fs.existsSync(fullPath)){
				fileStat = fs.statSync(path+'\\' + file);
				if(fileStat.isFile()){
					pd(I,file+' is File');
					files.fileArr.push(file);
				}else if(fileStat.isDirectory()){
					pd(I,file+' is Dir');
					files.dirArr.push(file);
				}else{
					pd(I,file+' is not a file or dir');
				}
			}else{
				pd(I,file+' is not exisits');
			}
		}
		catch(e){
			pd('e','process '+fullPath+' error:'+e.message)
		}
	}
	files.dirArr.sort();
	files.fileArr.sort();
	return files;
}

function winPath2FileURL(path){
	if(typeof(path)!=='string')
		return "";
	path.replace(/\\/g, "/");
	return 'file://'+path;
}
function getParentPath(path){
	let pathArr = dir.dirPath.split('\\');
	if(pathArr.length<2){
		return null;
	}
	
}