function startApp() {
    showHideMenuLinks();
    showView('viewHome');
    attachAllEvents();
    $('#ads > table tr').each((index, element) => {
        if (index = 1) {
            $(element).append($("<th>Actions</th>"));
        }
    });
}