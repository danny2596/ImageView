const fs = require('fs-extra');
const NOT_EXISTS=0;
const FILE=2;
const DIRECTROY=3;
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

		fullPath = mergePath(path,file);
		try{
			if(fs.existsSync(fullPath)){
				fileStat = fs.statSync(fullPath);
				if(fileStat.isFile()){
					files.fileArr.push(file);
				}else if(fileStat.isDirectory()){
					files.dirArr.push(file);
				}else{
					// pd(I,"@processFile.js > readDir,"+file+' is not a file or dir');
				}
			}else{
				// pd(I,"@processFile.js > readDir,"+file+' is not exisits');
			}
		}
		catch(e){
			pd('e',"@processFile.js > readDir, process "+fullPath+' error:'+e.message)
		}
	}
	//files.dirArr.alphanumSort();
	
	//files.dirArr.sort(function(p1,p2){
	//	return p1.localeCompare(p2);
	//});
	files.dirArr.sort(stringCompare);
	files.fileArr.alphanumSort();
	return files;
}

function printInUnicode(str){
	let i=0;
	let uniArr=[];
	pd(I,"-----------------------------");
	for(i=0;i<str.length;i++){
		uniArr.push(str.charCodeAt(i));
	}
	pd(I,"in uni="+uniArr);
}

function typeOfCharInUnicode(code){
	let hiragana_first = "ぁ";
	let katakana_last = "ヿ";
	let hf = hiragana_first.charCodeAt(0);
	let kl = katakana_last.charCodeAt(0);
	//pd(I,"hf = "+hf+", kl = "+kl);

	if(code < hf){
		//pd("before haiagana");		
		return 0;
	}else if(code <= kl){
		//pd("katakana or hiragana");
		return 1;
	}else{
		//pd("afer kana");
		return 2;
	}
}
function stringCompare(p1,p2){
	let l1,l2,size,i,c1,c2;
	l1 = p1.length;
	l2 = p2.length;
	if(l1>l2)
		size = l2;
	else
		size=l1;

	for(i=0;i<size;i++){
		c1=p1.charCodeAt(i);
		c2=p2.charCodeAt(i);
		if(c1!=c2)
			break;
	}
	if(c1!=c2){
		let ty1 = typeOfCharInUnicode(c1);
		let ty2 = typeOfCharInUnicode(c2);
		if(ty1 == ty2){
			return p1.localeCompare(p2);
		}else if(ty1 > ty2){
			return 1;
		}else{
			return -1;
		}
	}
	else
	{
		return p1.localeCompare(p2);
	}
	return p1.localeCompare(p2);

}

function checkConfig(){
	let config;
	try{
		let current_path = process.cwd();
		pd(I,current_path);
		config = mergePath(current_path, "config.json");
	}catch(e){
		console.log("Error XXX");
		config = "./config.json";
	}
	
	
	//let config = "./config.json";
	try{
		console.log("check file : "+config);
		if(fs.existsSync(config))
		{
			pd("config exist read config ==> print config file");
			//print config
			
			// fs.readFileSync(config).toString().split('\n').forEach(function (line) { 
			// 	console.log(line);
			// });
			let configText = fs.readFileSync(config).toString();
			console.log(configText);
			
			pd("prase json by readJsonSync");	
			//use readJsonSync
			let configObj = fs.readJsonSync(config);
			console.dir(configObj);
			if(configObj){
				if(configObj.moveTarget && $.isArray(configObj.moveTarget)){
					for(let i =0;i<4;i++){
						let tDir=configObj.moveTarget[i];
						moveTarget[i] = "";
						if(checkStatus(tDir) == DIRECTROY){
							moveTarget[i] = configObj.moveTarget[i];
						}
					}
				}
				if(configObj.delPic && configObj.delPic.length != 0 && checkStatus(configObj.delPic) == DIRECTROY){
					backup = configObj.delPic;
				}else
				{
					SW("Config", "delPic is null");
					backup = "";
				}
			}
			pd("print moveTarget");
			console.dir(moveTarget);
			console.log("backup="+backup)
		}else{
			pd("config not EXIST create a config file");
			let obj={};
			obj.moveTarget = [];
			obj.moveTarget[0]="";
			obj.moveTarget[1]="";
			obj.moveTarget[2]="";
			obj.moveTarget[3]="";
			obj.delPic="";
			fs.outputJsonSync(config,obj);
		}
	}catch(e){
		pd("e","@processFile.js >> checkConfig error:"+e.message);
	}
	
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
			case '\'':
				res=res+'%27';
				break;
		}
	}
	//pd(I,"@processFile > winPath2FileURL; count="+count+", path.length="+path.length+", res="+res);
	// path.replace(/\\/g, "/");
	// return 'file:///'+path;
	return res;
}
function getParentPath(path){
	// pd(I,"@processFile > getParentPath; start, path="+path);
	let pathArr = path.split('\\');
	if(pathArr.length<2){
		return null;
	}
	let res="";
	let i=0;
	for(i=0;i<pathArr.length-1;i++){
		res = res + pathArr[i]+"\\";
	}
	// pd(I,"@processFile > getParentPath; return="+res);
	return res;
}

function getName(path){
	// pd(I,"@processFile > getName; start, path="+path);
	let pathArr = path.split('\\');
	if(pathArr.length<1){
		return null;
	}
	if(pathArr[pathArr.length-1].length>0){
		// pd(I,"@processFile > getName; (1) return="+pathArr[pathArr.length-1]);
		return pathArr[pathArr.length-1];
	}else{
		// pd(I,"@processFile > getName; (2) return="+pathArr[pathArr.length-2]);
		return pathArr[pathArr.length-2];
	}
}
function isImage(name){
	if(typeof(name) !== 'string'){
		pd(I,'@processFile > isImage; name is not a string');
		return false;
	}
	let r = name.toLowerCase().search("\\.jpg$|\\.png$|\\.bmp$|\\.jpeg$|\\.gif$");
	//pd(I,'@processFile > isImage; name='+name+", r="+r);
	if(r>=0)
		return true;
	else
		return false;
}
function mergePath(a,b){
	if(a[a.length-1]==='\\'){
		return a+b;
	}else{
		return a+'\\'+b;
	}
}
function checkStatus(path){
	/*
	const NOT_EXISTS=0;
	const FILE=2;
	const DIRECTROY=3;
	 */
	try{
		if(fs.existsSync(path)){
			fileStat = fs.statSync(path);
			if(fileStat.isFile()){
				return FILE;
			}else if(fileStat.isDirectory()){
				return DIRECTROY;
			}else{
				// pd(I,"@processFile.js > checkStatus,"+path+' is not a file or dir');
				return 'unknown';
			}
		}else{
			// pd(I,"@processFile.js > checkStatus,"+path+' is not exisits');
			return NOT_EXISTS;
		}
	}
	catch(e){
		pd('e',"@processFile.js > checkStatus, process "+path+' error:'+e.message)
		return 'error';
	}
}
function moveDirOrFile(src,dst){
	
	if(src[0]===dst[0] && src[0] !== '/'){
		pd(I,"@processFile.js > moveDirOrFile move by fs.rename");
		fs.rename(src,dst,function(err){
			if(err){
				alert("move error (rename)");
				pd('e','@processFile.js > move error(rename) : '+err);
			}
		});
	}
	else{
		pd(I,"@processFile.js > moveDirOrFile move by fs.move");
		fs.move(src,dst,function(err){
			if(err){
				alert("move error")
				pd('e','@processFile.js > move error : '+err);
			}
		});
	}
	
}