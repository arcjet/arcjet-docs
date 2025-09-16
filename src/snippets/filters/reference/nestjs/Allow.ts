import { filter } from "@arcjet/nest";
// ...
// This is part of the rules constructed using withRule or a guard
// ...
filter({
  allow: [
    // Requests matching this expression will be allowed. All other
    // requests will be denied.
    'http.request.method eq "GET" and ip.src.country eq "US" and not ip.src.vpn',
    ,
  ],
  mode: "LIVE",
});
