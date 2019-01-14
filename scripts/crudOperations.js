const BASE_URL = 'https://baas.kinvey.com/'
const APP_KEY = 'kid_H1vQroYV7'
const APP_SECRET = '57e9667b92fc42ffa72e8ef21208e2f9'
const AUTH_HEADERS = {'Authorization': "Basic " + btoa(APP_KEY + ":" + APP_SECRET)}


function loginUser() {
    let username = $('#formLogin input[name="username"]').val();
    let password = $('#formLogin input[name="passwd"]').val();
    $.ajax({
        method: "POST",
        url:BASE_URL + 'user/' + APP_KEY + '/login',
        headers: AUTH_HEADERS,
        data:{username,password}
    }).then(function (res) {
        signInUser(res, 'Login successful.')
    }).catch(handleAjaxError)
}

function registerUser() {
    let username = $('#formRegister input[name="username"]').val();
    let password = $('#formRegister input[name="passwd"]').val();
    $.ajax({
        method:"POST",
        url: BASE_URL + `user/` + APP_KEY + '/',
        headers:AUTH_HEADERS,
        data:{username,password}
    }).then(function (res) {
        signInUser(res,'Registration successful.')
    }).catch(handleAjaxError)
}
function createAd() {
    let date ;
    let input = $('#formCreateAd input[name="datePublished"]').val();
    let regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/g;
    if (input.match(regex)) {
         date = $('#formCreateAd input[name="datePublished"]').val();
    }
    else {
        showInfo('Insert date in the proper format');
    }
    let price = $('#formCreateAd input[name="price"]').val();
    if (price === "") {
        showInfo('Insert price');
    }
    else {
        price = Number($('#formCreateAd input[name="price"]').val()).toFixed(2);
    }
    let description = $('#formCreateAd textarea').val();
    if (description === "") {
        showInfo('Insert description');
    }
    let title = $('#formCreateAd input[name="title"]').val();
    if (title ==="") {
        showInfo('Insert title');
    }
    let user = localStorage.getItem("username");
    if (date &&price&&description&&title) {
        $.ajax({
            method:"POST",
            url:BASE_URL + 'appdata/' + APP_KEY + '/items',
            headers:{Authorization: 'Kinvey ' + localStorage.getItem('authToken')},
            data:{description,date,price,title,user}
        }).then(function () {
            showInfo('Book created.');
            listAds();
        }).catch(handleAjaxError)
    }

}
function listAds() {
    $.ajax({
        method:'GET',
        url:BASE_URL + 'appdata/' + APP_KEY + '/items',
        headers:{Authorization: 'Kinvey ' + localStorage.getItem('authToken')}
    })
        .then(function (res) {
            showView('viewAds');
            if (res.length>=1) {
                $('#ads > table tr').each((index, element) => {
                    if (index > 0) {
                        $(element).remove()
                    }
                });

                for (let item of res) {
                    $('#ads > table tr').show();
                    $("#ads table div").remove()
                    let tr = $("<tr>");
                    let td = $("<td>").text(item.title)
                    tr.append(td);
                    td = $("<td>").text(item.user);
                    tr.append(td);
                    td = $("<td>").text(item.description);
                    tr.append(td);
                    td = $("<td>").text(item.price);
                    tr.append(td);
                    function pad(n) {return n < 10 ? "0"+n : n;}
                    let Data = new Date(item.date)
                   var date = pad(Data.getMonth()+1)+"/"+pad(Data.getDate())+"/"+Data.getFullYear();
                    td = $("<td>").text(date);
                    tr.append(td);
                    if (item._acl.creator === localStorage.getItem("userId")) {

                        let td = $('<td>')
                        let aDel = $('<a href="#">[Delete]</a>').on('click', function () {
                            deleteAd(item)
                        })
                        let aEdit = $('<a href="#">[Edit]</a>').on('click', function () {
                            loadAdForEdit(item)
                        })
                        td.append(aDel).append(aEdit)
                        tr.append(td)
                    }

                    $("#ads tbody").append(tr)
                }
            }else {
                $('#ads > table tr').each((index, element) => {
                    if (index > 0) {
                        $(element).remove()
                    }
                });
                $('#ads > table tr').hide();
                $("#ads table div").remove()
                $("#ads table").append($("<div>").text("No advertisements available"))
            }
        }).catch(handleAjaxError)
}
function deleteAd(book) {
    $.ajax({
        method:"DELETE",
        url:BASE_URL + 'appdata/' + APP_KEY + '/items/' + book._id,
        headers:{Authorization: 'Kinvey ' + localStorage.getItem('authToken')}
    }).then(function () {
        listAds()
        showInfo('Book deleted.')
    })
    // DELETE -> BASE_URL + 'appdata/' + APP_KEY + '/books/' + book._id
    // showInfo('Book deleted.')
}

function loadAdForEdit(ad) {
    showView('viewEditAd');
    $('#formEditAd input[name="title"]').attr("value", ad.title);
    $('#formEditAd textarea').text(ad.description);
    $('#formEditAd input[name="datePublished"]').attr("value", ad.date);
    $('#formEditAd input[name="price"]').attr("value", ad.price);
    $("#formEditAd").attr("_id", ad._id)
}

function editAd() {
   let title =  $('#formEditAd input[name="title"]').val();
    if (title ==="") {
        showInfo('Insert title');
    }
   let description = $('#formEditAd textarea').val();
    if (description ==="") {
        showInfo('Insert description');
    }
    let date ;
    let input = $('#formEditAd input[name="datePublished"]').val();
    let regex = /^[0-9]{4}-[0-9]{2}-[0-9]{2}/g;
    if (input.match(regex)) {
         date = input;
    }
    else {
        showInfo('Insert date in the proper format');
    }

   let price = $('#formEditAd input[name="price"]').val();
    if (price ==="") {
        showInfo('Insert price');
    }
    let user = localStorage.getItem("username");
   let id = $("#formEditAd").attr("_id");
    if (date &&price&&description&&title) {
        $.ajax({
            method: "PUT",
            url: BASE_URL + 'appdata/' + APP_KEY + '/items/' + id,
            headers: {Authorization: 'Kinvey ' + localStorage.getItem('authToken')},
            data: {title, description, date, price, user}
        }).then(function () {
            showInfo('Book edited.');
            listAds()
        }).catch(handleAjaxError)
    }

}

function saveAuthInSession(userInfo) {
    localStorage.setItem('authToken', userInfo._kmd.authtoken)
    localStorage.setItem('username', userInfo.username)
    localStorage.setItem('userId', userInfo._id)
}

function logoutUser() {
    $.ajax({
        method: 'POST',
        url: BASE_URL +  'user/' + APP_KEY + '/_logout',
        headers: {Authorization: 'Kinvey ' + localStorage.getItem('authToken')}
    })
    localStorage.clear();
    showHomeView();
    showHideMenuLinks();
    $('#loggedInUser').text("")
    showInfo('Logout successful.')
}

function signInUser(res, message) {
    saveAuthInSession(res)
    showHideMenuLinks()
    showHomeView()
    $('#loggedInUser').text("Hello " + res.username + "!")
    showInfo(message)
}

function handleAjaxError(response) {
    let errorMsg = JSON.stringify(response)
    if (response.readyState === 0)
        errorMsg = "Cannot connect due to network error."
    if (response.responseJSON && response.responseJSON.description)
        errorMsg = response.responseJSON.description
    showError(errorMsg)
}