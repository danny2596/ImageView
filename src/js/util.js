const I='i';
function pd(p1,p2,p3) //print debug
{
	let msg;
	let isWarn=false;
	switch(p1){
		case 'error':
		case 'e':
		case 'err':
			console.error(msg);
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