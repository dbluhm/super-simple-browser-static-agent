window.crypto = {};
window.crypto.extension_exists = false;

(function() {

    register_cb('pong', pong);

    function pong() {
        window.crypto.extension_exists = true;
    }

    function ping() {
        window.postMessage(
            {
                direction: "from-page-script",
                method: "ping"
            },
            "*"
        );
    }

    function pack_message(message, to_key) {
        window.postMessage(
            {
                direction: "from-page-script",
                method: 'pack',
                message: message,
                to_key: to_key
            },
            "*"
        );
    }

    function unpack_message(message) {
        window.postMessage(
            {
                direction: "from-page-script",
                method: 'unpack',
                message: message
            },
            "*"
        );
    }

    function register_cb(method, cb) {
        window.addEventListener("message", function(event) {
            if (event.source == window &&
                event.data &&
                event.data.direction == "from-content-script" &&
                event.data.method == method) {

                cb(event.data.response);
            }
        })
    }

    function register_pack_cb(cb) {
        register_cb('pack', cb);
    }
    function register_unpack_cb(cb) {
        register_cb('unpack', cb);
    }

    crypto.pack_message = pack_message;
    crypto.unpack_message = unpack_message;
    crypto.register_pack_cb = register_pack_cb;
    crypto.register_unpack_cb = register_unpack_cb;
    crypto.ping = ping;
}).call(this);

