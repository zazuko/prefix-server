# partially based on https://docs.varnish-software.com/tutorials/caching-post-requests/
vcl 4.0;

import std;
import bodyaccess;

backend express {
    .host = "backend";
    .port = "3000";

    .connect_timeout = 10s;
    .first_byte_timeout = 2m;
    .between_bytes_timeout = 5s;
}

sub vcl_recv {
    # cache POST requests
    unset req.http.X-Body-Len;

    # Happens before we check if we have this in cache already.

    set req.http.X-Forwarded-Port = "80";
    set req.backend_hint = express;

    // pass through URLs ending with ?nocache
    if (req.url ~ "\?nocache$") {
        set req.url = regsub(req.url, "\?$", "");
        return (pass);
    }

    if (req.method == "POST" && req.url ~ "^/query") {
        std.log("Will cache POST for: " + req.http.host + req.url);
        std.cache_req_body(500KB);
        set req.http.X-Body-Len = bodyaccess.len_req_body();
        if (req.http.X-Body-Len == "-1") {
            return(synth(400, "The request body size exceeds the limit"));
        }
        return (hash);
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

sub vcl_hash {
    # To cache POST and PUT requests
    if (req.http.X-Body-Len) {
        bodyaccess.hash_req_body();
    } else {
        hash_data("");
    }
}

sub vcl_backend_fetch {
    if (bereq.http.X-Body-Len) {
        set bereq.method = "POST";
    }
}
