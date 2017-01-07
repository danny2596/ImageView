const electron = require('electron');
// Module to control application life.
const app = electron.app;
// Module to create native browser window.
const BrowserWindow = electron.BrowserWindow;

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow;

function createWindow () {
	mainWindow = new BrowserWindow({width: 1280, height: 720});
	mainWindow.loadURL('file://' + __dirname + '/index.html');
	
	//add window event
	mainWindow.on('closed', function () {
		mainWindow = null;
	});

	//show
	mainWindow.show();
}
function printMessage(msg){
	if(mainWindow){
		mainWindow.webContents.send('print-msg',msg);
	}
}

//add app events
app.on('ready', createWindow);
app.on('window-all-closed', function () {
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
app.on('activate', function () {
	if (mainWindow === null) {
		createWindow();
	}
});

//open file,dir dialog
const ipc = require('electron').ipcMain
const dialog = require('electron').dialog
ipc.on('open-file-dialog', function (event) {
	dialog.showOpenDialog(
		{properties: ['openDirectory']}, 
		function (files) {
			if (files){
				event.sender.send('selected-directory', files)
			} else{
				event.sender.send('nothing-selected');
			}
		}
	);
});
ipc.on('open-devtool',function(){
	mainWindow.webContents.openDevTools();
});

