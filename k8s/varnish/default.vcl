vcl 4.0;

import std;
import bodyaccess;

backend express {
    .host = "server";
    .port = "80";

    .connect_timeout = 10s;
    .first_byte_timeout = 2m;
    .between_bytes_timeout = 5s;
}

sub vcl_recv {
    # Happens before we check if we have this in cache already.
    set req.http.X-Forwarded-Port = "80";
    set req.backend_hint = express;

    # don't cache /api/health
    if (req.url ~ "^/api/v1/health") {
        return (pass);
    }
}

sub vcl_backend_response {
    # Happens after we have read the response headers from the backend.
    #
    # Here you clean the response headers, removing silly Set-Cookie headers
    # and other mistakes your backend does.
    set beresp.ttl = 4w;
}

sub vcl_deliver {
    # Happens when we have all the pieces we need, and are about to send the
    # response to the client.
    #
    # You can do accounting or modifying the final object here.
}

sub vcl_synth {
    if (resp.status == 301 || resp.status == 302) {
        set resp.http.location = resp.reason;
        set resp.reason = "Moved";
        return (deliver);
    }
}
