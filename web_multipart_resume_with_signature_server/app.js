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

let signatureRequest = async (req, callback) => {
    let body = JSON.stringify(req.operation, null, 2);
    console.log('Sending request to signature server: ', body);
    await fetch(`${signatureServer}/operation?channel=header`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body,
    })
        .then(response => response.json())
        .then(async response => {
            // Apply signature.
            req.applySignature(response.authorization);

            // Send signed request.
            await req.send((error, response) => {
                if (error) {
                    console.log(req.operation.uri + " request failed", error);
                    return
                }
                console.log(req.operation.uri + ' finished request.');
                console.log(response);
                callback(response)
            });
        });
};

// In order to start a multipart upload, we need to init a MultipartUpload.
let multipartUpload = async (f) => {
    let upload_id = '';

    // If upload_id can't be stored, we should list all multipart.
    const listMultipartUploadsRequest = bucket.listMultipartUploadsRequest({
        "prefix": f.name
    });
    await signatureRequest(listMultipartUploadsRequest, (resp) => {
        uploads = resp.uploads;
        console.log("All uploads is ", uploads);
        if (uploads.length >= 1) {
            upload_id = uploads[0].upload_id
        }
    });

    if (upload_id === '') {
        const initiateMultipartUploadRequest = bucket.initiateMultipartUploadRequest(f.name, {
            "Content-Type": f.type
        });
        await signatureRequest(initiateMultipartUploadRequest, (resp) => {
            upload_id = resp.upload_id;
            console.log("Upload ID is ", upload_id)
        });
    }

    // Split file in 10MB a part.
    let part_size = 10 * 1024 * 1024;
    let part_number = 0;
    let start = 0;

    // Upload current part number.
    const listMultipartRequest = bucket.listMultipartRequest(f.name, {
        "upload_id": upload_id
    });
    await signatureRequest(listMultipartRequest, (resp) => {
        part_number = resp.count;
        start = part_size * part_number
    });

    while (start < f.size) {
        let end = Math.min(start + part_size, f.size);
        let filePart = f.slice(start, end);
        start = part_size * ++part_number;
        if (filePart.size <= 0)
            continue;

        let uploadPartsRequest = bucket.uploadMultipartRequest(f.name, {
            'upload_id': upload_id,
            'part_number': part_number,
            'body': filePart,
        });
        await signatureRequest(uploadPartsRequest, (resp) => {
        });
    }

    let object_parts = [];
    for (let i = 1; i <= part_number; i++) {
        object_parts.push({
            'part_number': i,
        })
    }

    const completeMultipartRequest = bucket.completeMultipartUploadRequest(f.name, {
        'upload_id': upload_id,
        'object_parts': object_parts,
    });
    await signatureRequest(completeMultipartRequest, (resp) => {
    });
};

let upload = () => {
    let f = document.getElementById("file").files[0];
    let reader = new FileReader();
    reader.readAsArrayBuffer(f);
    reader.onload = (() => {
        multipartUpload(f);
    });
};