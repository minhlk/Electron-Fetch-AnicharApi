const ipcRenderer = require('electron').ipcRenderer
let media
let page = 1
let searchWord = null
GetList(searchWord, page);
document.getElementById('btn-search').addEventListener('click', (e) => {
    document.getElementsByClassName('searchbox')[0].style.display = 'block'
})
document.getElementsByClassName('close')[0].addEventListener('click', (e) => {
    document.getElementsByClassName('searchbox')[0].style.display = 'none'
})
document.getElementById('search-form').addEventListener('submit', (event) => {

    searchWord = document.getElementById('search-text').value
    document.getElementsByClassName('searchbox')[0].style.display = 'none'
    GetList(searchWord, page);
    event.preventDefault()
})
Home = () => {
    page = 1
    searchWord = null
    GetList(searchWord, page);
}
goNext = () => {
    page += 1
    GetList(searchWord, page);
}
goPrev = () => {
    page -= 1
    GetList(searchWord, page);
}

function GetList(search, page) {
    ipcRenderer.send('item:list', {
        searchKey: search,
        page: page
    })
    ipcRenderer.once('item:list', (event, rs) => {
        if (rs.success) {
            let data = JSON.parse(rs.data)
            media = data.data.Page.media
            let ul = document.getElementsByTagName('ul')[0]
            let temp = ''
            for (let i = 0; i < media.length; i++) {
                temp += `<li class="list-group-item" id="${media[i]._id}" onclick="showDetail(${media[i]._id},${i})"> 
                    <img class="img-circle media-object pull-left" src = "${media[i].coverImage.medium}" width = "40" height = "40" >
                    <div class="media-body">
                    <strong>${media[i].title.romaji}</strong>
                    <p>${media[i].description == null ? "Updating" : media[i].description}</p>
                    </div>
                    </li >`
            }
            if (temp === '')
                alert('No more result')
            ul.innerHTML = temp

        }
    })
}
showDetail = (id, i) => {
    if (media !== null) {
        let genres = '';
        let bannerImage = ''
        if (media[i].bannerImage !== null)
            bannerImage = `<div class="row">
                <img src="${media[i].bannerImage}" style="width: 100%;
                height: 25rem;
                object-fit: cover;"/>
                </div>`
        else
            bannerImage = `<div class="row">
                <div style="width: 100%;
                height: 25rem;
                object-fit: cover; background-color:grey;"/>
                </div>`
        for (let j = 0; j < media[i].genres.length; j++) {
            genres += `<span class="badge badge-pill badge-info p-3">${media[i].genres[j]}</span>&emsp;`
        }
        let detail = `
            ${bannerImage}
            <div class="row" style="position: absolute;
    top : 15rem;
    width: 100%;">

                        <div class="col-lg-4 cover-image">
                            <img src="${media[i].coverImage.large}" >
                        </div>
                        <div class="col-lg-7 right-pane">
                            <div class="card">
                                <div class="card-header text-center">
                                    Information
                                </div>
                                <div class="card-body">
                                    <h5 class="card-title">${media[i].type} Name : </h5>
                                    <p class="card-text">${media[i].title.romaji}</p>
                                    <hr>
                                    <h5 class="card-title">Description : </h5>
                                    <p class="card-text">${media[i].description == null ? "Updating" : media[i].description}</p>
                                </div>
                                <div class="card-footer">
                                     ${genres}
                                </div>
                            </div>
                        </div>
                    </div>`
        document.getElementById('right-detail').innerHTML = detail
    }
}