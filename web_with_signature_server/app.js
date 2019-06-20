let Config = qingstor_sdk.Config;
let QingStor = qingstor_sdk.QingStor;

const config = new Config().loadConfig({
    'host': 'qingstor.com',
    'port': '443',
    'protocol': 'https',
    'log_level': 'debug',
});

const signatureServer = 'http://127.0.0.1:3000';
const qsService = new QingStor(config);
const bucket = qsService.Bucket(BUCKET_NAME, BUCKET_ZONE);

let signatureRequest = (req) => {
    let body = JSON.stringify(req.operation, null, 2);
    console.log('Sending request to signature server: ', body);
    fetch(`${signatureServer}/operation?channel=header`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
        .then(response => response.json())
        .then(response => {
            // Apply signature.
            req.applySignature(response.authorization);

            // Send signed request.
            req.send((error, response) => {
                if (error) {
                    console.log(req.url + " request failed", error);
                    return
                }
                console.log(req.url + ' finished request.');
                console.log(response);
            });
        });
};

// PutObject example.
const putObjectRequest = bucket.putObjectRequest('test-file', {body: 'Hello'});
signatureRequest(putObjectRequest);

// ListObject example.
const listObjectRequest = bucket.listObjectsRequest();
signatureRequest(listObjectRequest);
