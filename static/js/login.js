$('#login').click((e) => {
    $.ajax({
        url: '/login',
        method: 'post',
        dataType: 'json',
        data: {
            name: 'xxx',
            age: '18',
            salary: '50000'
        },
        success: (res) => {
            alert('the data is:' + res.status);
        },
        error: (err) => {
            console.error(err.message);
        }
    })
});


$('#logout').click((e) => {
    $.ajax({
        url: '/logout',
        method: 'put',
        dataType: 'json',
        success: (res) => {
            alert('the data is:' + res.status);
        },
        error: (err) => {
            console.error(err.message);
        }
    })
});
