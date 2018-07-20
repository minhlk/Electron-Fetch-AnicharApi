const url = require('url')
const path = require('path')
const { app, BrowserWindow, Menu, ipcMain } = require('electron')
var request = require('request-promise');
// const fetch = require('electron-fetch')
// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let mainWindow
let subWindow, detail
let page = 1
function createWindow() {
    // Create the browser window.
    mainWindow = new BrowserWindow({ width: 800, height: 600, icon: __dirname + '/assets/icons/png/icon.png' })
    console.log(__dirname + '/assets/icons/png/icon.png')
    // and load the index.html of the app.
    // let path = 'file://' + __dirname + '/mainWindow.html';
    mainWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/views/main.com.html'),
        protocol: 'file',
        slashes: true
    }))
    // const menu = Menu.buildFromTemplate(template)
    Menu.setApplicationMenu(null)



    // Open the DevTools.
    mainWindow.webContents.openDevTools()
  
    // Emitted when the window is closed.
    mainWindow.on('closed', () => {
        // Dereference the window object, usually you would store windows
        // in an array if your app supports multi windows, this is the time
        // when you should delete the corresponding element.
        // mainWindow = null
        app.quit()
    })
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow)

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
        app.quit()

    }
})

app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow()
    }
})
showSubWindow = () => {
    subWindow = new BrowserWindow({
        width: 400, height: 300, icon: __dirname + '/assets/icons/png/icon.png',
        'accept-first-mouse': true,
        'title-bar-style': 'hidden'
    })
    // let path = 'file://' + __dirname + '/mainWindow.html';
    subWindow.loadURL(url.format({
        pathname: path.join(__dirname, '/subWindow.html'),
        protocol: 'file',
        slashes: true
    }))
}
// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
// ipcMain.on('item:add', (event, arg) => {
//     // console.log(arg) // prints "ping"
//     mainWindow.webContents.send('item:add', arg)
// })
ipcMain.on('item:list', (event, arg) => {
    displayAnimes(arg.page, 'item:list', arg.searchKey)
});


const {PATH} = require('./config/config')
displayAnimes = (page,eventName,search) => {
    var query = `
          query ($page: Int, $perPage: Int, $search : String) {
            Page (page: $page, perPage: $perPage) {
                  
              pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
                perPage
              }
              media(search : $search) {
                _id : id
                title {
                  romaji
                  english
                  native
                  userPreferred
                }
                genres 
                description
                status
                coverImage {
                  large
                  medium
                }
                type
                bannerImage
              }
            }
          }
          `;
    var variables = {
        search: search,
        page: page,
        perPage: 20
    };
    var options = {
        method: 'POST',
        uri: PATH.API_URL,
        // json: true,
        // form: {
        //     // Like <input type="text" name="name">
        //     name: 'Josh'
        // },
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
        },
        body: JSON.stringify({
            query: query,
            variables: variables
        })
    };
    response = {};
    request(options).then(body => {
        response = { msg: 'Success', success: true, data: body }
    }).catch(err => {
        response = { msg: 'Fail to get detail ' + err, success: false }
    }).finally(function () {
        mainWindow.webContents.send(eventName, response)
    });
}
