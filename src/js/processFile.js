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
		if(typeof(file) !== 'string')
			continue;

		fullPath = path+'\\' + file;
		try{
			if(fs.existsSync(fullPath)){
				fileStat = fs.statSync(path+'\\' + file);
				if(fileStat.isFile()){
					files.fileArr.push(file);
				}else if(fileStat.isDirectory()){
					files.dirArr.push(file);
				}else{
					pd(I,"@processFile.js > readDir,"+file+' is not a file or dir');
				}
			}else{
				pd(I,"@processFile.js > readDir,"+file+' is not exisits');
			}
		}
		catch(e){
			pd('e',"@processFile.js > readDir, process "+fullPath+' error:'+e.message)
		}
	}
	files.dirArr.alphanumSort();
	files.fileArr.alphanumSort();
	return files;
}

function winPath2FileURL(path){
	if(typeof(path)!=='string')
		return "";
	let res="file:///";
	for(let i=0; i<path.length;i++){
		switch(path[i]){
			default:
				res=res+path[i];
				break;
			case '\\':
				res=res+'/';
				break;
			case '#':
				res=res+'%23';
				break;
		}
	}
	//pd(I,"@processFile > winPath2FileURL; count="+count+", path.length="+path.length+", res="+res);
	// path.replace(/\\/g, "/");
	// return 'file:///'+path;
	return res;
}
function getParentPath(path){
	pd(I,"@processFile > getParentPath; start, path="+path);
	let pathArr = path.split('\\');
	if(pathArr.length<2){
		return null;
	}
	let res="";
	let i=0;
	for(i=0;i<pathArr.length-1;i++){
		res = res + pathArr[i]+"\\";
	}
	pd(I,"@processFile > getParentPath; return="+res);
	return res;
}

function getName(path){
	pd(I,"@processFile > getName; start, path="+path);
	let pathArr = path.split('\\');
	if(pathArr.length<1){
		return null;
	}
	if(pathArr[pathArr.length-1].length>0){
		pd(I,"@processFile > getName; (1) return="+pathArr[pathArr.length-1]);
		return pathArr[pathArr.length-1];
	}else{
		pd(I,"@processFile > getName; (2) return="+pathArr[pathArr.length-2]);
		return pathArr[pathArr.length-2];
	}
}
function isImage(name){
	if(typeof(name) !== 'string'){
		pd(I,'@processFile > isImage; name is not a string');
		return false;
	}
	let r = name.toLowerCase().search("\\.jpg$|\\.png$|\\.bmp$|\\.jpeg$");
	//pd(I,'@processFile > isImage; name='+name+", r="+r);
	if(r>=0)
		return true;
	else
		return false;
}