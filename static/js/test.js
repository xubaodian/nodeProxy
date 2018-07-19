function proxy(option) {
    console.log(option);
    return function(req,res){
        console.log(req, res);
    }
}

function router(url, callback) {
    if (url) {
        callback('req', 'res');
    }
}

router('/get', proxy({header: 'h'}));