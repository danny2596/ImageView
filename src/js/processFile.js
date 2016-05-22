const fs = require('fs');

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
	return files;
}