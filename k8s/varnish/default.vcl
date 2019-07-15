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

  if (req.restarts == 0) {
    set req.http.x-state = "cache_check";
    return (hash);
  } else if (req.http.x-state == "backend_check") {
    return (pass);
  } else {
    return (hash);
  }
}

sub vcl_hit {
  if (req.http.x-state == "cache_check") {
    set req.http.x-state = "backend_check";
    set req.http.etag = obj.http.etag;
    return (restart);
  } else {
    return (deliver);
  }
}

sub vcl_backend_fetch {
  if (bereq.http.x-state == "backend_check") {
    set bereq.method = "HEAD";
    set bereq.http.method = "HEAD";
  }
}

sub vcl_backend_response {
  set beresp.ttl = 1w;

  if (bereq.http.x-state == "backend_check") {
    if (bereq.http.etag != beresp.http.etag) {
      ban("obj.http.etag == " + bereq.http.etag);
    }
  }
}

sub vcl_deliver {
  if (req.http.x-state == "backend_check") {
    set req.http.x-state = "valid";
    return (restart);
  }
}
