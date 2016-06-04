const I='i';
function pd(p1,p2,p3) //print debug
{
	let msg;
	let isWarn=false;
	switch(p1){
		case 'error':
		case 'e':
		case 'err':
			console.error(p2);
			return;
			break;
		case 'information':
		case 'i':
		case 'info':
			msg=p2;
			break;
		case 'warn':
		case 'w':
			isWarn=true;
			msg=p2;
			break;
		default:
			msg=p1;
			break;
	}
	if(isWarn){
		console.warn(msg);
	}
	else{
		if(typeof(msg)==='string'){
			console.log(msg);
		}
		else{
			console.log(msg);
		}
	}
}

function stringArrayCmp(a,b){
	if(a.length !== b.length){
		return false;
	}
	for(let i=0;i<a.length;i++){
		pd(I,"cmp a="+a[i]+", b="+b[i]);
		if(a[i]!==b[i]){
			return false;
		}
	}
	return true;
}