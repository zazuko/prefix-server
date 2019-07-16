vcl 4.0;

# tail -f /var/log/syslog
# import std;
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

  # don't cache health endpoint
  if (req.url ~ "^/api/v1/health") {
    return (pass);
  }
  # std.syslog(0, "");

  if (req.restarts == 0) {
    set req.http.x-state = "cache_check";
    # std.syslog(0, "CHECK CACHE");
    return (hash);
  } else if (req.http.x-state == "backend_check") {
    # std.syslog(0, "CHECK BACKEND");
    return (pass);
  } else {
    # std.syslog(0, "RETURN CACHED");
    return (hash);
  }
}

sub vcl_hit {
  # std.syslog(0, "HIT");
  if (req.http.x-state == "cache_check") {
    # std.syslog(0, "RESTART");
    set req.http.x-state = "backend_check";
    # apply etag from cache to the request and restart
    set req.http.etag = obj.http.etag;
    return (restart);
  }
}

sub vcl_miss {
  # std.syslog(0, "MISS");
}

sub vcl_backend_fetch {
  if (bereq.http.x-state == "backend_check") {
    # std.syslog(0, "HEAD");
    set bereq.method = "HEAD";
    set bereq.http.method = "HEAD";
  } else {
    # std.syslog(0, "GET");
  }
}

sub vcl_backend_response {
  set beresp.ttl = 1w;

  if (bereq.http.x-state == "backend_check") {
    if (bereq.http.etag != beresp.http.etag) {
      ban("obj.http.etag == " + bereq.http.etag);
      # std.syslog(0, "STALE");
      set beresp.http.x-state = "stale";
    } else {
      # std.syslog(0, "VALID");
      set beresp.http.x-state = "valid";
      return (deliver);
    }
  }
}

sub vcl_deliver {
  if (req.http.x-state == "backend_check") {
    if (resp.http.x-state == "stale") {
      set req.http.x-state = "";
      # std.syslog(0, "RESTART BECAUSE STALE");
      return (restart);
    }
    # std.syslog(0, "RESTART WHILE VALID");
    set req.http.x-state = "valid";
    return (restart);
  }
  # std.syslog(0, "FINAL DELIVER");
  # std.syslog(0, "-------------------");
  # std.syslog(0, "");
}
