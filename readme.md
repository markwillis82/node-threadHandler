#Thread Handler

This allows you to batch spawn commands but only allow a limited amount of them to run at any time.

This was built initially to help send out php (swiftmailer) emails without bogging down the server.

Normal eventEmitters are used from the child spawn api, but with an additional PID.

See examples for usage