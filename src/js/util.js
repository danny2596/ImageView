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
		//pd(I,"cmp a="+a[i]+", b="+b[i]);
		if(a[i]!==b[i]){
			return false;
		}
	}
	return true;
}
function SW(title,p1,p2){
	if(typeof(title)==='undefined'||title===null){
		return;
	}
	let time;
	let tm2=typeof(p1);
	let opt ={};

	//setup title, and basic timer
	opt.title=title;
	opt.timer = 800; //100ms
	opt.showConfirmButton =false;
	opt.background='rgba(255,255,255,0.7)';

	//setup timer and time
	if(typeof(p2) === 'number' && tm2 !== 'undefined'){
		opt.text=p1;
		opt.timer=p2;
	}else if(tm2==='string'){
		opt.text=p1;
	}else if(tm2==='number'){
		opt.timer = p1;
	}

	//show sweet alert
	swal(opt);
}