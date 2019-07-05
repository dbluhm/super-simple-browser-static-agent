
// background communication {{{

let comm = new DIDComm.DIDComm()

async function caller(m, sendResponse) {
    await comm.Ready;

    let ret_val = null;
    switch (m.method) {
        case "crypto_sign_keypair":
            ret_val = comm.generateKeyPair()
            break;
        case "pack_message":
            ret_val = comm.packMessage(m.message, m.to_keys, m.keys);
            break;
        case "unpack_message":
            ret_val = comm.unpackMessage(m.message, m.keys);
            break;
        default:
            console.error("Unrecognized caller data: " + JSON.stringify(m));
            break;
    }
    return ret_val;
}
window.addEventListener('message', function(event) {
    console.log("message from background_page", event);
    let promise_tag = event.data.tag;

    caller(event.data.msg).then( (ret) => {
        let envelope = {
            'tag': promise_tag,
            'response': ret
        };
        event.source.postMessage(envelope, "*");
    });
});
// }}}

