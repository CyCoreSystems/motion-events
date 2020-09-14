cam event handler
===

Receives events from GNU `motion` and loads them into Redis.

The Redis schema contains three key patterns:

*  `events:enum:<cameraId>:<motionEventNumber>`
   *  Temporary map of camera:motionEventId to event UUID
   *  This handler will simply override any preexisting key
   *  A TTL of 1 hour is set for auto-cleanup
*  `events:time:<cameraId>`
   *  Sorted set
   *  Score is equal to the unix timestamp of the event
   *  Value is the event UUID
*  `events:data:<event-UUID>`
   *  Hash
   *  Stores all the relevant data of the event
      * `Timestamp`: Unix Timestamp of the event
      * `Camera`: Camera id (thread number of `motion` config)
      * `ImageFile`: Full path of the most significant image
      * `VideoFile`: Full path of the video recording
